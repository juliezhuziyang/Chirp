"""Generate short placeholder WAV clips for the social intervention library."""

from __future__ import annotations

import math
import struct
import wave
from pathlib import Path

OUT = Path(__file__).resolve().parents[1] / "public" / "audio" / "intervention"

CLIPS = [
    ("happy-call-1.wav", 880, 2.0),
    ("social-chat-1.wav", 1200, 2.5),
    ("social-flock-1.wav", 660, 2.0),
]


def write_chirp_wav(path: Path, freq: float, duration: float, sample_rate: int = 22050) -> None:
    n = int(sample_rate * duration)
    with wave.open(str(path), "w") as wf:
        wf.setnchannels(1)
        wf.setsampwidth(2)
        wf.setframerate(sample_rate)
        for i in range(n):
            t = i / sample_rate
            envelope = math.sin(math.pi * min(t / 0.05, 1)) * math.sin(
                math.pi * min((duration - t) / 0.15, 1)
            )
            sample = int(16000 * envelope * math.sin(2 * math.pi * freq * t))
            wf.writeframes(struct.pack("<h", max(-32768, min(32767, sample))))


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    for filename, freq, dur in CLIPS:
        write_chirp_wav(OUT / filename, freq, dur)
        print(f"Wrote {OUT / filename}")


if __name__ == "__main__":
    main()
