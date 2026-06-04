# Start the Chirp ML analysis API (port 8000)
$mlRoot = Resolve-Path (Join-Path $PSScriptRoot "..\..\ml-service")
Set-Location $mlRoot

if (-not (Test-Path "models\bird_classifier.joblib")) {
  Write-Host "Training models (first run)..." -ForegroundColor Yellow
  python train_models.py
  if ($LASTEXITCODE -ne 0) {
    Write-Error "train_models.py failed. Install Python 3.10+ and run: pip install -r requirements.txt"
    exit 1
  }
}

Write-Host "Starting ML service at http://127.0.0.1:8000" -ForegroundColor Green
python -m uvicorn main:app --reload --port 8000
