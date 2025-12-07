import cv2
import mediapipe as mp
import numpy as np
from typing import Dict, List, Tuple
import time

class VideoAnalyzer:
    def __init__(self):
        # Initialize MediaPipe Face Mesh for eye tracking
        self.mp_face_mesh = mp.solutions.face_mesh
        self.face_mesh = self.mp_face_mesh.FaceMesh(
            max_num_faces=1,
            refine_landmarks=True,
            min_detection_confidence=0.5,
            min_tracking_confidence=0.5
        )

        # Initialize MediaPipe Hands for gesture detection
        self.mp_hands = mp.solutions.hands
        self.hands = self.mp_hands.Hands(
            max_num_hands=2,
            min_detection_confidence=0.5,
            min_tracking_confidence=0.5
        )

        # Eye landmarks indices for eye contact detection
        self.LEFT_EYE_INDICES = [362, 385, 387, 263, 373, 380]
        self.RIGHT_EYE_INDICES = [33, 160, 158, 133, 153, 144]

        # Facial expression landmarks
        self.MOUTH_CORNER_INDICES = [61, 291]  # Left and right mouth corners
        self.EYEBROW_INDICES = [70, 63, 105, 66, 107, 336, 296, 334, 293, 300]  # Eyebrow points

        # Gesture tracking
        self.gesture_count = 0
        self.last_gesture_time = time.time()

    def analyze_frame(self, frame: np.ndarray) -> Dict:
        """Analyze a single video frame for eye contact, gestures, and facial expressions."""
        rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        results = {}

        # Face analysis
        face_results = self.face_mesh.process(rgb_frame)
        if face_results.multi_face_landmarks:
            face_landmarks = face_results.multi_face_landmarks[0]
            results.update(self._analyze_eye_contact(face_landmarks))
            results.update(self._analyze_facial_expression(face_landmarks))

        # Hand gesture analysis
        hand_results = self.hands.process(rgb_frame)
        if hand_results.multi_hand_landmarks:
            results.update(self._analyze_gestures(hand_results.multi_hand_landmarks))

        return results

    def _analyze_eye_contact(self, face_landmarks) -> Dict:
        """Calculate eye contact percentage based on eye openness and gaze direction."""
        try:
            # Get eye landmarks
            left_eye_points = [face_landmarks.landmark[i] for i in self.LEFT_EYE_INDICES]
            right_eye_points = [face_landmarks.landmark[i] for i in self.RIGHT_EYE_INDICES]

            # Calculate eye openness (EAR - Eye Aspect Ratio)
            def eye_aspect_ratio(eye_points):
                # Vertical distances
                v1 = np.linalg.norm(np.array([eye_points[1].x, eye_points[1].y]) -
                                  np.array([eye_points[5].x, eye_points[5].y]))
                v2 = np.linalg.norm(np.array([eye_points[2].x, eye_points[2].y]) -
                                  np.array([eye_points[4].x, eye_points[4].y]))
                # Horizontal distance
                h = np.linalg.norm(np.array([eye_points[0].x, eye_points[0].y]) -
                                 np.array([eye_points[3].x, eye_points[3].y]))
                return (v1 + v2) / (2.0 * h)

            left_ear = eye_aspect_ratio(left_eye_points)
            right_ear = eye_aspect_ratio(right_eye_points)
            avg_ear = (left_ear + right_ear) / 2.0

            # Eye contact score (higher EAR means more open eyes, better contact)
            eye_contact_score = min(100, max(0, avg_ear * 200))  # Scale to 0-100

            return {
                "eye_contact": eye_contact_score,
                "eye_openness": avg_ear
            }
        except Exception as e:
            print(f"Error analyzing eye contact: {e}")
            return {"eye_contact": 50, "eye_openness": 0.3}

    def _analyze_facial_expression(self, face_landmarks) -> Dict:
        """Analyze facial expressions based on mouth and eyebrow positions."""
        try:
            # Mouth analysis for smile/frown
            mouth_left = face_landmarks.landmark[self.MOUTH_CORNER_INDICES[0]]
            mouth_right = face_landmarks.landmark[self.MOUTH_CORNER_INDICES[1]]

            mouth_width = abs(mouth_right.x - mouth_left.x)
            mouth_height = abs(mouth_right.y - mouth_left.y)

            # Simple expression classification
            if mouth_height > mouth_width * 0.3:
                expression = "smiling"
            elif mouth_height < mouth_width * 0.1:
                expression = "neutral"
            else:
                expression = "tense"

            return {
                "facial_expression": expression,
                "mouth_openness": mouth_height
            }
        except Exception as e:
            print(f"Error analyzing facial expression: {e}")
            return {"facial_expression": "neutral", "mouth_openness": 0.1}

    def _analyze_gestures(self, hand_landmarks) -> Dict:
        """Analyze hand gestures and movement frequency."""
        try:
            current_time = time.time()

            # Count gestures (simplified - detect hand movement)
            if current_time - self.last_gesture_time > 2.0:  # Reset every 2 seconds
                self.gesture_count = 0
                self.last_gesture_time = current_time

            # Simple gesture detection based on hand position changes
            if len(hand_landmarks) > 0:
                self.gesture_count += 1

            gesture_frequency = min(10, self.gesture_count)  # Cap at 10 gestures per 2 seconds

            return {
                "gesture_frequency": gesture_frequency,
                "hands_detected": len(hand_landmarks)
            }
        except Exception as e:
            print(f"Error analyzing gestures: {e}")
            return {"gesture_frequency": 0, "hands_detected": 0}

    def analyze_video_stream(self, frames: List[np.ndarray]) -> Dict:
        """Analyze multiple frames from a video stream."""
        if not frames:
            return self._get_default_analysis()

        eye_contacts = []
        expressions = []
        gestures = []

        for frame in frames:
            analysis = self.analyze_frame(frame)
            eye_contacts.append(analysis.get("eye_contact", 50))
            expressions.append(analysis.get("facial_expression", "neutral"))
            gestures.append(analysis.get("gesture_frequency", 0))

        # Calculate averages and statistics
        avg_eye_contact = np.mean(eye_contacts) if eye_contacts else 50

        # Most common expression
        expression_counts = {}
        for exp in expressions:
            expression_counts[exp] = expression_counts.get(exp, 0) + 1
        dominant_expression = max(expression_counts, key=expression_counts.get) if expression_counts else "neutral"

        avg_gesture_freq = np.mean(gestures) if gestures else 0

        return {
            "avg_eye_contact": round(avg_eye_contact, 1),
            "dominant_expression": dominant_expression,
            "avg_gesture_frequency": round(avg_gesture_freq, 1),
            "expression_distribution": expression_counts,
            "eye_contact_trend": eye_contacts[-10:] if len(eye_contacts) > 10 else eye_contacts  # Last 10 frames
        }

    def _get_default_analysis(self) -> Dict:
        """Return default analysis when no video data is available."""
        return {
            "avg_eye_contact": 50.0,
            "dominant_expression": "neutral",
            "avg_gesture_frequency": 0.0,
            "expression_distribution": {"neutral": 1},
            "eye_contact_trend": [50] * 10
        }

    def cleanup(self):
        """Clean up resources."""
        self.face_mesh.close()
        self.hands.close()

# Global analyzer instance
video_analyzer = VideoAnalyzer()
