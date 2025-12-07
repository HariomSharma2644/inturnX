import requests
import json
import os
from typing import Dict, Optional
from datetime import datetime

class AvatarGenerator:
    def __init__(self):
        # Ready Player Me API configuration
        self.api_key = os.getenv("READY_PLAYER_ME_API_KEY", "")
        self.base_url = "https://api.readyplayer.me/v1"

        # Avatar configurations for different personalities
        self.avatar_configs = {
            "technical": {
                "gender": "male",
                "style": "professional",
                "hair": "short",
                "outfit": "business_casual",
                "expression": "focused"
            },
            "hr": {
                "gender": "female",
                "style": "professional",
                "hair": "medium",
                "outfit": "business_formal",
                "expression": "welcoming"
            },
            "behavioral": {
                "gender": "male",
                "style": "professional",
                "hair": "medium",
                "outfit": "business_casual",
                "expression": "approachable"
            }
        }

    def generate_avatar_url(self, personality: str = "technical") -> str:
        """Generate avatar URL for a specific personality."""
        config = self.avatar_configs.get(personality, self.avatar_configs["technical"])

        # For demo purposes, return a placeholder URL
        # In production, this would call Ready Player Me API
        avatar_urls = {
            "technical": "https://models.readyplayer.me/64a8c6b3d6b4c8b8e8f8a8b8.glb",
            "hr": "https://models.readyplayer.me/64a8c6b3d6b4c8b8e8f8a8b9.glb",
            "behavioral": "https://models.readyplayer.me/64a8c6b3d6b4c8b8e8f8a8ba.glb"
        }

        return avatar_urls.get(personality, avatar_urls["technical"])

    def get_avatar_animation(self, emotion: str = "neutral") -> Dict:
        """Get animation data for avatar based on emotion."""
        animations = {
            "neutral": {
                "animation": "idle",
                "duration": 3000,
                "loop": True
            },
            "thinking": {
                "animation": "thinking",
                "duration": 2000,
                "loop": True
            },
            "speaking": {
                "animation": "talking",
                "duration": 1500,
                "loop": False
            },
            "listening": {
                "animation": "listening",
                "duration": 2500,
                "loop": True
            },
            "nodding": {
                "animation": "nodding",
                "duration": 1000,
                "loop": False
            },
            "surprised": {
                "animation": "surprised",
                "duration": 800,
                "loop": False
            }
        }

        return animations.get(emotion, animations["neutral"])

    def generate_lip_sync_data(self, text: str, audio_duration: float) -> Dict:
        """Generate lip sync data for avatar speech."""
        # Simple phoneme-based lip sync
        # In production, this would use more sophisticated analysis
        phonemes = self._text_to_phonemes(text)
        duration_per_phoneme = audio_duration / len(phonemes) if phonemes else 0.1

        lip_sync_data = {
            "phonemes": phonemes,
            "timestamps": [i * duration_per_phoneme for i in range(len(phonemes))],
            "visemes": [self._phoneme_to_viseme(p) for p in phonemes],
            "total_duration": audio_duration
        }

        return lip_sync_data

    def _text_to_phonemes(self, text: str) -> list:
        """Convert text to phonemes (simplified)."""
        text = text.lower()
        phonemes = []

        # Very basic phoneme mapping
        phoneme_map = {
            'a': 'AA', 'e': 'EH', 'i': 'IY', 'o': 'OW', 'u': 'UW',
            'b': 'B', 'd': 'D', 'g': 'G', 'p': 'P', 't': 'T', 'k': 'K',
            's': 'S', 'sh': 'SH', 'f': 'F', 'th': 'TH', 'm': 'M', 'n': 'N'
        }

        for char in text:
            if char in phoneme_map:
                phonemes.append(phoneme_map[char])
            elif char.isspace():
                continue
            else:
                phonemes.append('AA')  # Default vowel sound

        return phonemes

    def _phoneme_to_viseme(self, phoneme: str) -> str:
        """Convert phoneme to viseme (mouth shape)."""
        viseme_map = {
            'AA': 'open', 'EH': 'wide', 'IY': 'narrow', 'OW': 'round', 'UW': 'pucker',
            'B': 'closed', 'D': 'closed', 'G': 'closed', 'P': 'closed', 'T': 'closed', 'K': 'closed',
            'S': 'wide', 'SH': 'wide', 'F': 'wide', 'TH': 'wide', 'M': 'closed', 'N': 'closed'
        }

        return viseme_map.get(phoneme, 'neutral')

    def get_gesture_data(self, personality: str, context: str) -> Dict:
        """Generate gesture data based on personality and context."""
        gestures = {
            "technical": {
                "thinking": ["adjust_glasses", "nod_slightly"],
                "explaining": ["point", "gesture_with_hand"],
                "asking": ["lean_forward", "open_hands"]
            },
            "hr": {
                "welcoming": ["smile", "open_arms"],
                "listening": ["nod_encouragingly", "maintain_eye_contact"],
                "asking": ["tilt_head", "smile_warmly"]
            },
            "behavioral": {
                "thinking": ["stroke_chin", "look_up"],
                "explaining": ["use_hands", "gesture_openly"],
                "asking": ["lean_in", "maintain_posture"]
            }
        }

        personality_gestures = gestures.get(personality, gestures["technical"])

        # Select appropriate gesture based on context
        if "think" in context.lower():
            gesture_list = personality_gestures["thinking"]
        elif "explain" in context.lower() or "answer" in context.lower():
            gesture_list = personality_gestures["explaining"]
        else:
            gesture_list = personality_gestures["asking"]

        return {
            "gestures": gesture_list,
            "timing": "during_speech",
            "intensity": "moderate"
        }

# Global avatar generator instance
avatar_generator = AvatarGenerator()
