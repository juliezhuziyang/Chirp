"""Audio feature extraction matching 01_audio_feature_extraction.ipynb."""

from __future__ import annotations

import tempfile
from pathlib import Path

import librosa
import numpy as np

from .constants import FEATURE_COLUMNS
from .debug_log import debug_log


def extract_features_from_path(file_path: str | Path, sr: int = 22050, n_mfcc: int = 13) -> np.ndarray:
    path = Path(file_path)
    suffix = path.suffix.lower()
    if suffix == ".wav":
        import soundfile as sf

        y, file_sr = sf.read(path, always_2d=False)
        if y.ndim > 1:
            y = y.mean(axis=1)
        if file_sr != sr:
            y = librosa.resample(y, orig_sr=file_sr, target_sr=sr)
        return extract_features_from_signal(y, sr, n_mfcc=n_mfcc)

    y, sr = librosa.load(file_path, sr=sr, mono=True)
    return extract_features_from_signal(y, sr, n_mfcc=n_mfcc)


def extract_features_from_bytes(
    audio_bytes: bytes,
    suffix: str = ".wav",
    sr: int = 22050,
    n_mfcc: int = 13,
) -> np.ndarray:
    with tempfile.NamedTemporaryFile(suffix=suffix, delete=False) as tmp:
        tmp.write(audio_bytes)
        tmp_path = tmp.name
    try:
        debug_log(
            "feature_extraction.py:extract_features_from_bytes",
            "loading temp audio",
            {"suffix": suffix, "tmpPath": tmp_path, "bytesLen": len(audio_bytes)},
            "A",
        )
        features = extract_features_from_path(tmp_path, sr=sr, n_mfcc=n_mfcc)
        debug_log(
            "feature_extraction.py:extract_features_from_bytes",
            "features extracted",
            {"featureLen": int(len(features)), "featureSum": float(features.sum())},
            "B",
        )
        return features
    except Exception as exc:
        debug_log(
            "feature_extraction.py:extract_features_from_bytes",
            "librosa load failed",
            {"suffix": suffix, "excType": type(exc).__name__, "excMsg": str(exc)},
            "A",
        )
        raise
    finally:
        Path(tmp_path).unlink(missing_ok=True)


def extract_features_from_signal(y: np.ndarray, sr: int, n_mfcc: int = 13) -> np.ndarray:
    mfccs = librosa.feature.mfcc(y=y, sr=sr, n_mfcc=n_mfcc)
    mfcc_mean = mfccs.mean(axis=1)
    mfcc_std = mfccs.std(axis=1)

    chroma = librosa.feature.chroma_stft(y=y, sr=sr)
    chroma_mean = chroma.mean(axis=1)

    zcr = librosa.feature.zero_crossing_rate(y)
    zcr_mean = float(zcr.mean())

    rms = librosa.feature.rms(y=y)
    rms_mean = float(rms.mean())

    spec_cent = librosa.feature.spectral_centroid(y=y, sr=sr)
    spec_cent_mean = float(spec_cent.mean())

    return np.concatenate([mfcc_mean, mfcc_std, chroma_mean, [zcr_mean, rms_mean, spec_cent_mean]])


def features_to_dict(vector: np.ndarray) -> dict[str, float]:
    if len(vector) != len(FEATURE_COLUMNS):
        raise ValueError(f"Expected {len(FEATURE_COLUMNS)} features, got {len(vector)}")
    return {col: float(val) for col, val in zip(FEATURE_COLUMNS, vector)}
