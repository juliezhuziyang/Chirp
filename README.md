# Chirp 🐦

**Chirp aims to use AI to help humans better understand the vocal expressions of pet lovebirds, fostering more empathetic and informed care.**

## Background
Pet lovebirds rely heavily on vocalization to communicate their needs and emotional states. 
However, human caretakers often interpret these sounds intuitively, which may lead to misunderstanding or overlooked stress signals.  
Chirp explores whether AI can serve as a supportive tool to bridge this communication gap.

## Project Goal
This project aims to:
- Explore patterns in lovebird vocalizations using audio analysis
- Classify common vocal sounds into broad behavioral or emotional categories
- Provide interpretable feedback to support better pet care

This project does NOT aim to:
- Fully translate bird language
- Replace human observation or veterinary advice

## Running the code

Run `npm i` to install the dependencies.

Run `npm run dev` to start the development server.

## Bird sound ML analysis

Sound Emotion Recognition uses the Python service in `ml-service/` (not notebooks at runtime).

  1. Install Python 3.10+, then:
     ```powershell
     cd ml-service
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
