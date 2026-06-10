# Chirp ML Service

Python API for bird sound analysis: feature extraction, bird detection, and Lasso emotion prediction.

## Setup

```bash
cd ml-service
python -m venv .venv
.venv\Scripts\activate   # Windows
pip install -r requirements.txt
python train_models.py
uvicorn main:app --reload --port 8000
```

Training reads CSVs from `ml-service/data/` (with fallback to the parent workspace `CHIRP/` folder) and writes joblib models to `ml-service/models/`.

## API

- `GET /health` — service status
- `POST /analyze` — multipart field `audio` (wav, webm, mp3, etc.)

## Frontend

The Chirp app proxies `/api/ml` to this service in development (`vite.config.ts`). Set `VITE_ML_SERVICE_URL` for production.
