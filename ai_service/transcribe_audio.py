import whisper
import numpy as np
from typing import Optional

class AudioTranscriber:
    def __init__(self, model_size="base"):
        """Initialize Whisper model for speech-to-text."""
        self.model = whisper.load_model(model_size)

    def transcribe_audio(self, audio_data: bytes) -> str:
        """Transcribe audio data to text."""
        try:
            # Convert bytes to numpy array (assuming WAV format)
            audio_np = np.frombuffer(audio_data, dtype=np.int16).astype(np.float32) / 32768.0

            # Transcribe using Whisper
            result = self.model.transcribe(audio_np, language="en")
            return result["text"].strip()
        except Exception as e:
            print(f"Error transcribing audio: {e}")
            return ""

    def transcribe_file(self, file_path: str) -> str:
        """Transcribe audio from file."""
        try:
            result = self.model.transcribe(file_path, language="en")
            return result["text"].strip()
        except Exception as e:
            print(f"Error transcribing file: {e}")
            return ""

# Global transcriber instance
transcriber = AudioTranscriber()