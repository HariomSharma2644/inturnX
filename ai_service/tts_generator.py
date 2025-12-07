import requests
import os
import base64
from typing import Dict, Optional
from datetime import datetime

class TTSGenerator:
    def __init__(self):
        # ElevenLabs API configuration
        self.api_key = os.getenv("ELEVENLABS_API_KEY", "")
        self.base_url = "https://api.elevenlabs.io/v1"

        # Voice configurations for different personalities
        self.voice_configs = {
            "technical": {
                "voice_id": "21m00Tcm4TlvDq8ikWAM",  # Male professional voice
                "stability": 0.75,
                "similarity_boost": 0.8,
                "style": 0.5,
                "use_speaker_boost": True
            },
            "hr": {
                "voice_id": "AZnzlk1XvdvUeBnXmlld",  # Female warm voice
                "stability": 0.8,
                "similarity_boost": 0.85,
                "style": 0.6,
                "use_speaker_boost": True
            },
            "behavioral": {
                "voice_id": "29vD33N1CtxCmqQRPOHJ",  # Male approachable voice
                "stability": 0.7,
                "similarity_boost": 0.75,
                "style": 0.4,
                "use_speaker_boost": True
            }
        }

    def generate_speech(self, text: str, personality: str = "technical") -> Dict:
        """Generate speech audio for given text."""
        voice_config = self.voice_configs.get(personality, self.voice_configs["technical"])

        if not self.api_key:
            # Fallback to Web Speech API simulation
            return self._generate_fallback_audio(text, personality)

        try:
            url = f"{self.base_url}/text-to-speech/{voice_config['voice_id']}"

            headers = {
                "Accept": "audio/mpeg",
                "Content-Type": "application/json",
                "xi-api-key": self.api_key
            }

            data = {
                "text": text,
                "model_id": "eleven_monolingual_v1",
                "voice_settings": {
                    "stability": voice_config["stability"],
                    "similarity_boost": voice_config["similarity_boost"],
                    "style": voice_config["style"],
                    "use_speaker_boost": voice_config["use_speaker_boost"]
                }
            }

            response = requests.post(url, json=data, headers=headers)

            if response.status_code == 200:
                # Convert audio to base64
                audio_base64 = base64.b64encode(response.content).decode('utf-8')

                return {
                    "audio_data": audio_base64,
                    "format": "mp3",
                    "personality": personality,
                    "duration": self._estimate_duration(text),
                    "generated_at": datetime.now().isoformat()
                }
            else:
                print(f"ElevenLabs API error: {response.status_code}")
                return self._generate_fallback_audio(text, personality)

        except Exception as e:
            print(f"Error generating speech: {e}")
            return self._generate_fallback_audio(text, personality)

    def _generate_fallback_audio(self, text: str, personality: str) -> Dict:
        """Generate fallback audio data when API is not available."""
        # Create a simple audio placeholder
        # In a real implementation, this could use Web Speech API or local TTS

        duration = self._estimate_duration(text)

        return {
            "audio_data": "",  # Empty for Web Speech API fallback
            "format": "web_speech",
            "personality": personality,
            "duration": duration,
            "generated_at": datetime.now().isoformat(),
            "fallback": True
        }

    def _estimate_duration(self, text: str) -> float:
        """Estimate speech duration based on text length."""
        # Rough estimate: 150 words per minute, 2.5 words per second
        words = len(text.split())
        return max(1.0, words / 2.5)

    def get_voice_characteristics(self, personality: str) -> Dict:
        """Get voice characteristics for a personality."""
        characteristics = {
            "technical": {
                "pace": "moderate",
                "tone": "confident",
                "emphasis": "clear",
                "pauses": "strategic"
            },
            "hr": {
                "pace": "warm",
                "tone": "encouraging",
                "emphasis": "empathetic",
                "pauses": "comfortable"
            },
            "behavioral": {
                "pace": "measured",
                "tone": "approachable",
                "emphasis": "thoughtful",
                "pauses": "reflective"
            }
        }

        return characteristics.get(personality, characteristics["technical"])

    def generate_question_audio(self, question_data: Dict) -> Dict:
        """Generate audio for a complete question with interviewer introduction."""
        personality = question_data.get("personality", "technical")
        interviewer_name = question_data.get("interviewer_name", "Interviewer")
        question = question_data.get("question", "")

        # Create full script
        full_text = f"{interviewer_name} asks: {question}"

        # Generate speech
        speech_data = self.generate_speech(full_text, personality)

        # Add question metadata
        speech_data.update({
            "question_id": question_data.get("id", ""),
            "question_text": question,
            "interviewer_name": interviewer_name,
            "personality": personality
        })

        return speech_data

# Global TTS generator instance
tts_generator = TTSGenerator()
