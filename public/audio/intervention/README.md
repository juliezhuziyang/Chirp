# Intervention audio library

Verified clips used when the app suggests positive social parrot sounds.

Each clip in the backend library has:

- `emotion_label`: `happy` or `socially_engaged`
- `validation_status`: must be `verified` for intervention playback

Replace the placeholder WAV files here with your manually verified recordings, then update entries via `POST /audio-library` or edit `audio_library.ts` seed data.

Regenerate placeholders:

```bash
python scripts/generate-intervention-audio.py
```
