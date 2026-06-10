import os
from pathlib import Path

ML_SERVICE_ROOT = Path(__file__).resolve().parents[1]
MODELS_DIR = ML_SERVICE_ROOT / "models"
DATA_DIR = ML_SERVICE_ROOT / "data"

# Legacy workspace root (CHIRP/ parent) when CSVs are not bundled under data/
WORKSPACE_ROOT = ML_SERVICE_ROOT.parent.parent


def _training_csv(filename: str) -> Path:
    bundled = DATA_DIR / filename
    if bundled.exists():
        return bundled
    legacy = WORKSPACE_ROOT / filename
    if legacy.exists():
        return legacy
    return bundled


NOISE_CSV = _training_csv("noise_features.csv")
BIRD_CSV = _training_csv("features_04_parameterTest.csv")

BIRD_METADATA_COLS = [
    "Number",
    "FileName",
    "Segment",
    "Valence",
    "Arousal",
    "SocialEngagement",
    "Time",
    "Behavior",
    "Gender",
    "Age",
]

EMOTION_METADATA_COLS = [
    "Number",
    "FileName",
    "Valence",
    "Arousal",
    "SocialEngagement",
    "Time",
    "Behavior",
    "Gender",
    "Age",
]

MFCC_COLS = [f"mfcc{i + 1}_mean" for i in range(13)] + [f"mfcc{i + 1}_std" for i in range(13)]
CHROMA_COLS = [f"chroma{i + 1}" for i in range(12)]
OTHER_COLS = ["zcr", "rms", "spectral_centroid"]
FEATURE_COLUMNS = MFCC_COLS + CHROMA_COLS + OTHER_COLS

NOT_BIRD_MESSAGE = (
    "We couldn't confidently detect bird vocalizations in this recording. "
    "Try moving closer to your bird and reducing background noise."
)
