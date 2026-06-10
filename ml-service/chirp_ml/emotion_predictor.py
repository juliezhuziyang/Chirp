"""Lasso emotion regression matching 02_baseline_model_parameterTest.ipynb."""

from __future__ import annotations

from pathlib import Path

import joblib
import numpy as np
import pandas as pd

from .constants import FEATURE_COLUMNS, MODELS_DIR


def _clip_scores(valence: float, arousal: float, social: float) -> dict[str, float]:
    return {
        "valence": float(np.clip(valence, -5, 5)),
        "arousal": float(np.clip(arousal, 0, 5)),
        "socialEngagement": float(np.clip(social, -5, 5)),
    }


class EmotionPredictor:
    def __init__(self, models_dir: Path | None = None):
        base = models_dir or MODELS_DIR
        paths = {
            "valence": base / "lasso_valence.joblib",
            "arousal": base / "lasso_arousal.joblib",
            "social": base / "lasso_social.joblib",
        }
        for key, path in paths.items():
            if not path.exists():
                raise FileNotFoundError(
                    f"Emotion model '{key}' not found at {path}. Run: python train_models.py"
                )
        self.pipelines = {key: joblib.load(path) for key, path in paths.items()}

    def predict(self, features: np.ndarray | pd.DataFrame) -> dict[str, float]:
        if isinstance(features, np.ndarray):
            features = pd.DataFrame([features], columns=FEATURE_COLUMNS)
        x = features[FEATURE_COLUMNS]
        valence = float(self.pipelines["valence"].predict(x)[0])
        arousal = float(self.pipelines["arousal"].predict(x)[0])
        social = float(self.pipelines["social"].predict(x)[0])
        return _clip_scores(valence, arousal, social)
