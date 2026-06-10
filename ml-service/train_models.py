"""
Train and export bird classifier + Lasso emotion models from CHIRP CSV datasets.
Run from ml-service directory: python train_models.py
"""

from __future__ import annotations

import json
from pathlib import Path

import joblib
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.linear_model import Lasso
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler

from chirp_ml.constants import (
    BIRD_CSV,
    BIRD_METADATA_COLS,
    EMOTION_METADATA_COLS,
    FEATURE_COLUMNS,
    MODELS_DIR,
    NOISE_CSV,
)


def train_bird_classifier() -> RandomForestClassifier:
    noise_df = pd.read_csv(NOISE_CSV)
    bird_df = pd.read_csv(BIRD_CSV)

    feature_cols = [c for c in noise_df.columns if c not in BIRD_METADATA_COLS]
    assert feature_cols == [c for c in bird_df.columns if c not in BIRD_METADATA_COLS]

    noise_df["Class"] = 0
    bird_df["Class"] = 1
    data = pd.concat(
        [noise_df[feature_cols + ["Class"]], bird_df[feature_cols + ["Class"]]],
        ignore_index=True,
    )

    x = data[feature_cols]
    y = data["Class"]
    x_train, _, y_train, _ = train_test_split(
        x, y, test_size=0.2, random_state=42, stratify=y
    )

    clf = RandomForestClassifier(n_estimators=100, random_state=42)
    clf.fit(x_train, y_train)
    return clf


def train_emotion_models() -> dict[str, Pipeline]:
    df = pd.read_csv(BIRD_CSV)
    y = df[["Valence", "Arousal", "SocialEngagement"]]
    x = df.drop(columns=EMOTION_METADATA_COLS)

    audio_cols = [c for c in FEATURE_COLUMNS if c in x.columns]
    x = x[audio_cols]

    x_train, _, y_train, _ = train_test_split(x, y, test_size=0.2, random_state=42)

    pipelines: dict[str, Pipeline] = {}
    for dim, key in [
        ("Valence", "valence"),
        ("Arousal", "arousal"),
        ("SocialEngagement", "social"),
    ]:
        pipeline = Pipeline(
            [
                ("scaler", StandardScaler()),
                ("model", Lasso(alpha=0.1)),
            ]
        )
        pipeline.fit(x_train, y_train[dim])
        pipelines[key] = pipeline
    return pipelines


def main() -> None:
    MODELS_DIR.mkdir(parents=True, exist_ok=True)

    print("Training bird classifier...")
    bird_clf = train_bird_classifier()
    joblib.dump(bird_clf, MODELS_DIR / "bird_classifier.joblib")

    print("Training Lasso emotion models (audio features only)...")
    emotion_models = train_emotion_models()
    joblib.dump(emotion_models["valence"], MODELS_DIR / "lasso_valence.joblib")
    joblib.dump(emotion_models["arousal"], MODELS_DIR / "lasso_arousal.joblib")
    joblib.dump(emotion_models["social"], MODELS_DIR / "lasso_social.joblib")

    (MODELS_DIR / "feature_columns.json").write_text(
        json.dumps(FEATURE_COLUMNS, indent=2),
        encoding="utf-8",
    )
    print(f"Models saved to {MODELS_DIR}")


if __name__ == "__main__":
    main()
