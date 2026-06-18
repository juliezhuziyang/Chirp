"""FastAPI service for Chirp bird sound emotion analysis."""

from __future__ import annotations

import os
from contextlib import asynccontextmanager

from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware

from chirp_ml.debug_log import debug_log
from chirp_ml.pipeline import AnalysisPipeline

pipeline: AnalysisPipeline | None = None


@asynccontextmanager
async def lifespan(_app: FastAPI):
    global pipeline
    try:
        pipeline = AnalysisPipeline()
        debug_log("main.py:lifespan", "pipeline loaded", {"ok": True}, "E")
    except FileNotFoundError as exc:
        print(f"WARNING: {exc}")
        debug_log("main.py:lifespan", "pipeline load failed", {"error": str(exc)}, "E")
        pipeline = None
    except Exception as exc:
        debug_log(
            "main.py:lifespan",
            "pipeline init unexpected error",
            {"type": type(exc).__name__, "error": str(exc)},
            "E",
        )
        raise
    yield


app = FastAPI(title="Chirp ML Service", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=os.getenv("CHIRP_ML_CORS", "*").split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root():
    return {
        "service": "Chirp ML Service",
        "endpoints": {
            "health": "GET /health",
            "analyze": "POST /analyze (multipart field: audio)",
        },
        "modelsLoaded": pipeline is not None,
    }


@app.get("/health")
def health():
    return {"ok": True, "modelsLoaded": pipeline is not None}


@app.post("/analyze")
async def analyze(audio: UploadFile = File(...)):
    if pipeline is None:
        raise HTTPException(
            status_code=503,
            detail="ML models not loaded. Run train_models.py and restart the service.",
        )

    content = await audio.read()
    if not content:
        raise HTTPException(status_code=400, detail="Empty audio file")

    suffix = ".webm"
    if audio.filename and "." in audio.filename:
        suffix = "." + audio.filename.rsplit(".", 1)[-1].lower()

    debug_log(
        "main.py:analyze",
        "analyze request",
        {
            "filename": audio.filename,
            "contentType": audio.content_type,
            "suffix": suffix,
            "bytesLen": len(content),
            "headHex": content[:16].hex() if content else "",
        },
        "D",
    )

    try:
        result = pipeline.analyze_bytes(content, suffix=suffix)
        debug_log(
            "main.py:analyze",
            "analyze success",
            {"birdDetected": result.get("birdDetected"), "keys": list(result.keys())},
            "C",
        )
        return result
    except Exception as exc:
        debug_log(
            "main.py:analyze",
            "analyze exception",
            {
                "excType": type(exc).__name__,
                "excMsg": str(exc),
                "excRepr": repr(exc)[:500],
            },
            "A",
        )
        raise HTTPException(status_code=500, detail=f"Analysis failed: {exc}") from exc


if __name__ == "__main__":
    import uvicorn

    port = int(os.getenv("PORT", "8000"))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)
