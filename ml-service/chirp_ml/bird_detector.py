"""Bird vs noise classification matching 04_bird_sound_detection.ipynb."""

from __future__ import annotations

from pathlib import Path

import joblib
import numpy as np
import pandas as pd

from .constants import FEATURE_COLUMNS, MODELS_DIR, NOT_BIRD_MESSAGE


class BirdDetector:
    def __init__(self, model_path: Path | None = None):
        path = model_path or MODELS_DIR / "bird_classifier.joblib"
        if not path.exists():
            raise FileNotFoundError(
                f"Bird classifier not found at {path}. Run: python train_models.py"
            )
        self.model = joblib.load(path)

    def predict(self, features: np.ndarray | pd.DataFrame) -> tuple[bool, float]:
        if isinstance(features, np.ndarray):
            features = pd.DataFrame([features], columns=FEATURE_COLUMNS)
        proba = self.model.predict_proba(features[FEATURE_COLUMNS])[0]
        bird_idx = list(self.model.classes_).index(1)
        bird_probability = float(proba[bird_idx])
        is_bird = bool(self.model.predict(features[FEATURE_COLUMNS])[0] == 1)
        return is_bird, bird_probability

    @staticmethod
    def not_bird_message() -> str:
        return NOT_BIRD_MESSAGE
