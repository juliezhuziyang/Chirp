"""End-to-end analysis: features → bird detection → emotion prediction."""

from __future__ import annotations

import numpy as np

from .bird_detector import BirdDetector
from .emotion_predictor import EmotionPredictor
from .debug_log import debug_log
from .feature_extraction import extract_features_from_bytes, extract_features_from_path


class AnalysisPipeline:
    def __init__(self):
        self.bird_detector = BirdDetector()
        self.emotion_predictor = EmotionPredictor()

    def analyze_bytes(self, audio_bytes: bytes, suffix: str = ".wav") -> dict:
        features = extract_features_from_bytes(audio_bytes, suffix=suffix)
        return self.analyze_features(features)

    def analyze_file(self, file_path: str) -> dict:
        features = extract_features_from_path(file_path)
        return self.analyze_features(features)

    def analyze_features(self, features: np.ndarray) -> dict:
        try:
            is_bird, bird_probability = self.bird_detector.predict(features)
        except Exception as exc:
            debug_log(
                "pipeline.py:analyze_features",
                "bird_detector failed",
                {"excType": type(exc).__name__, "excMsg": str(exc)},
                "C",
            )
            raise
        debug_log(
            "pipeline.py:analyze_features",
            "bird detection done",
            {"isBird": is_bird, "birdProbability": bird_probability},
            "C",
        )
        if not is_bird:
            return {
                "birdDetected": False,
                "birdProbability": bird_probability,
                "message": BirdDetector.not_bird_message(),
            }
        try:
            scores = self.emotion_predictor.predict(features)
        except Exception as exc:
            debug_log(
                "pipeline.py:analyze_features",
                "emotion_predictor failed",
                {"excType": type(exc).__name__, "excMsg": str(exc)},
                "C",
            )
            raise
        return {
            "birdDetected": True,
            "birdProbability": bird_probability,
            "scores": scores,
        }
