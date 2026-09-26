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

  2. In another terminal: `npm run dev` (proxies `/api/ml` → local ML service by default).

### Production ML service (Railway)

The ML API can run on [Railway](https://railway.app) instead of localhost. See `ml-service/README.md` for deploy steps.

1. Deploy the `ml-service` directory as a Railway service (Root Directory: `ml-service`).
2. Copy the Railway public URL and set it on your frontend host:
   ```
   VITE_ML_SERVICE_URL=https://your-ml-service.up.railway.app
   ```
3. Rebuild/redeploy the frontend. Sound analysis will call Railway directly.

For local dev against Railway, set `VITE_ML_SERVICE_URL` in `.env` (see `.env.example`).

Redeploy the edge function after social API changes:
`supabase functions deploy make-server-b89d4352 --project-ref edjtshisztwaunytdlxd --no-verify-jwt`


**Development Log**
### Version 1.0
1. Home page, How it works, About, Demo
2. Baseline model (not yet deployed)
### Version 1.1
1. Baseline model improved after changing parameter
2. Designed new metric to measure emotion (Valence-Arousal-Social Engagement)
### Version 1.2
1. Constructed behavioral observation model (a scoring system based completely on observation)
   Behavioral metrics: Movement Intensity, Body Posture, Directionality
3. Constructed the model that tied the behavioral observation to emotion (behavior-to-emotion linear model)
4. Finished dashboard design
5. Linked to Supabase

### Version 2.0
1. Added community function
2. Made UI better, clearer
3. Successful ML model deployment

### Version 3.0
1. Did playback experiments *900 (for each pre-recorded audio, I randomly assign it to three birds and record their response)
2. Applied experimental finding to new playback function (after users get the report, they can play a piece of audio for the bird)
### Version 3.1
1. Better playback grouping strategy
   Low energy/stressed/irritable - do not recommend playback
   Lonely/sad - play happy/conversational/loving sounds
   Interactive/happy/socially-engaged - play call/respond/conversational sounds
   Calm/neutral - play friendly sounds
### Version 3.2
1. Refined categorization model

### Version 4.0
1. Constructed model using Deep Lab Cut, taking into consideration behavioral aspects
2. Planned for how I can incorporate this technology into the project
### Version 4.1
1. The previous Deep Lab Cut model did not work well, a new solution:
   Only label the center of mass and analyze the movement
### Version 4.2
1. The 4.1 Deep Lab Cut model did not work well, a new solution:
   Use color (instead of movement) to first detect where the bird is, draw a tight frame around the bird, and then perform the supermodel provided by Deep Lab Cut within the frame.
2. Ran model for all the videos recorded in the playback experiments
3. Designed a new framework for behavioral analysis (instead of the observational scoring system before, I now use real coordinates) and re-ran the whole model
### Version 4.3
1. Coped with the problem concerning the angle the bird faces the camera
