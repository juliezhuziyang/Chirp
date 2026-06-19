# Chirp ML Service

Python API for bird sound analysis: feature extraction, bird detection, and Lasso emotion prediction.

## Setup (local)

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

- `GET /health` — service status (`{"ok": true, "modelsLoaded": true}`)
- `POST /analyze` — multipart field `audio` (wav, webm, mp3, etc.)

## Frontend

- **Development:** the Chirp app proxies `/api/ml` to a local or remote target via `vite.config.ts`. Default proxy target is `http://127.0.0.1:8000`; override with `VITE_ML_DEV_PROXY` or point at Railway with `VITE_ML_SERVICE_URL`.
- **Production:** set `VITE_ML_SERVICE_URL` to the public Railway URL (see `.env.example` in the repo root).

## Deploy to Railway

This service is configured for [Railway](https://railway.app) using the Dockerfile and `railway.toml` in this directory.

### Railway service settings

| Setting | Value |
|---------|--------|
| **Root Directory** | `ml-service` |
| **Builder** | Dockerfile (from `railway.toml`) |
| **Custom Start Command** | **Leave empty** — do not use Caddy or `file-server`; the Dockerfile runs uvicorn |
| **Health Check Path** | `/health` |

Remove any custom start command in Railway Settings → Deploy (e.g. `caddy file-server ...`). That overrides the Dockerfile and fails because Caddy is not installed in the ML image.

No separate build command is required; the Dockerfile runs `pip install -r requirements.txt` during the image build. Model files (`models/*.joblib`) and training CSVs (`data/*.csv`) are copied into the image from the repository.

### Environment variables (Railway)

| Variable | Required | Description |
|----------|----------|-------------|
| `PORT` | Auto-set by Railway | Do not override unless debugging |
| `CHIRP_ML_CORS` | Recommended | Comma-separated frontend origins, e.g. `https://your-app.com,http://localhost:5173`. Defaults to `*` if unset |

See `ml-service/.env.example` for a template.

### Test `/health` after deploy

Replace `YOUR_RAILWAY_URL` with the public domain from Railway (Settings → Networking → Generate Domain):

```bash
curl https://YOUR_RAILWAY_URL/health
```

Expected response:

```json
{"ok": true, "modelsLoaded": true}
```

If `modelsLoaded` is `false`, the model joblib files were not included in the deployment — confirm `models/` is committed and redeploy.

### Connect the frontend

1. Copy the Railway public URL (e.g. `https://chirp-ml-production.up.railway.app`).
2. Set `VITE_ML_SERVICE_URL` in your frontend hosting environment (or `.env` for local testing against Railway).
3. Rebuild and redeploy the frontend so Vite embeds the variable at build time.
