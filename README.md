
  # Chirp

  This is a code bundle for Chirp. The original project is available at https://www.figma.com/design/s3X3NvOYxPb7rpDMkMJGqS/Chirp.

  ## Running the code

  Run `npm i` to install the dependencies.

  Run `npm run dev` to start the development server.

  ## Bird sound ML analysis

  Sound Emotion Recognition uses the Python service in `../ml-service` (not notebooks at runtime).

  1. Install Python 3.10+, then:
     ```powershell
     cd ..\ml-service
     python -m venv .venv
     .\.venv\Scripts\activate
     pip install -r requirements.txt
     python train_models.py
     python -m uvicorn main:app --reload --port 8000
     ```
     Or from `Chirp`: `.\scripts\start-ml-service.ps1`

  2. In another terminal: `npm run dev` (proxies `/api/ml` → port 8000).

  Redeploy the edge function after social API changes:
  `supabase functions deploy make-server-b89d4352 --project-ref edjtshisztwaunytdlxd --no-verify-jwt`
