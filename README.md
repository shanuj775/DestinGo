# DestinGo

A GenAI-powered destination discovery and cultural experiences web app for the PromptWars challenge. The app uses React, Tailwind CSS, Express, Firebase Auth, Firestore, and the Gemini API.

## What Works End To End

- Route-based app pages: `/overview`, `/planner`, `/gems`, `/experiences`, `/events`, and `/trips`.
- Dynamic destination hero loaded from Firestore when configured, with demo fallback data for deployment previews.
- Expanded major Indian city destination list with city-specific background image URLs.
- Hindi/English UI and chatbot language support.
- Gemini itinerary generation through `POST /api/generate-itinerary`.
- Hidden gems loaded from the Firestore `places` collection.
- Gemini cultural storytelling through `POST /api/generate-story`.
- Culture Respect Meter through `POST /api/culture-respect`.
- Gemini cultural chatbot through `POST /api/chat` with selected-city context and conversation history.
- Saved trips written to and read from Firestore `savedTrips`.
- Local experience booking requests written to Firestore `bookings`.
- Events loaded from the Firestore `events` collection.
- Anonymous demo login for evaluators, plus optional email/password login.
- Vercel serverless API deployment support through `api/index.js` and `vercel.json`.
- Firebase Hosting config for static frontend deployment and Firestore rules.

## Setup

1. Install dependencies.

```bash
npm install
```

2. Create `.env` from `.env.example` and fill in the Firebase web config and Gemini API key.

```bash
cp .env.example .env
```

3. In Firebase Console:

- Create or select a Firebase project.
- Enable Firestore.
- Enable Firebase Auth.
- Enable Anonymous sign-in for evaluator demo mode.
- Optionally enable Email/Password sign-in and create a test user.

4. Deploy Firestore rules.

```bash
firebase deploy --only firestore:rules
```

5. Seed Firestore with real database records used by the app.

Use a service account JSON:

```bash
set GOOGLE_APPLICATION_CREDENTIALS=.\serviceAccountKey.json
npm run seed
```

Or use the inline service account variables shown in `.env.example`.

6. Run the app.

```bash
npm run dev
```

Frontend: `http://localhost:5173`

Backend: `http://localhost:5174`


## Deployment

### Recommended: Vercel Full App

1. Push this project to GitHub.
2. Import the repo in Vercel.
3. Add these environment variables in Vercel Project Settings:

```text
GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL=gemini-1.5-flash
VITE_FIREBASE_API_KEY=your_firebase_web_api_key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=000000000000
VITE_FIREBASE_APP_ID=1:000000000000:web:example
VITE_FIREBASE_DATABASE_ID=(default)
```

4. Deploy with:

```bash
npm run deploy:vercel
```

Vercel serves the React app from `dist` and routes `/api/*` to the Express backend through `api/index.js`.

### Firebase Hosting Option

Firebase Hosting can serve the frontend and Firestore rules, but the Express/Gemini backend still needs a Node host such as Vercel, Render, or Railway unless you add Cloud Functions.

```bash
npm run build
firebase deploy
```

### Database Seed

After Firebase credentials are configured, seed Firestore:

```bash
npm run seed
```
## Evaluator Demo Flow

1. Open `http://localhost:5173`.
2. Click `Demo Login` if you want to test saved trips and bookings without a password.
3. Select `Jaipur`.
4. Confirm the hero background, title, rating, best time, description, and tags update from Firestore.
5. Enter days, budget, interests, travel style, and language.
6. Click `Generate Plan`.
7. Confirm Gemini returns a fresh itinerary.
8. Click `Save Trip`.
9. Open `My Trips` and confirm the saved itinerary appears from Firestore.
10. Open `Hidden Gems`, click `Tell Me the Story`, and confirm Gemini returns a story.
11. Open `Experiences`, click `Request Experience`, and confirm a Firestore booking is created.
12. Open `Events` and confirm event cards load from Firestore.
13. Ask the DestinGo Chat about the selected city in English or Hindi and confirm Gemini replies live.

## Test Credentials

The app supports passwordless evaluator access through Firebase Anonymous Auth. Enable Anonymous sign-in in Firebase, then use the `Demo Login` button.

If your judging flow requires email/password credentials, create a Firebase Auth test user and share it with evaluators:

```text
Email: evaluator@example.com
Password: create-this-in-firebase
```

## Important Compliance Notes

- Firestore is the production database. The React app includes demo fallback records only so deployment previews still work when Firebase is not configured yet.
- Gemini output is never hardcoded. If `GEMINI_API_KEY` is missing or invalid, the backend returns an error instead of a fake itinerary or story.
- If Firestore config or seed data is missing, the UI uses clearly demo-mode local fallback data so evaluators can still test navigation, bookings, trips, and UI behavior.
- Exact event dates, prices, timings, and access rules can change, so seed text and Gemini prompts ask travelers to verify locally where needed.

## Project Structure

```text
server/index.js              Express backend and Gemini API routes
src/App.jsx                  React app, routed pages, and user flows
src/firebase.js              Firebase web config
src/services/api.js          Frontend API client
src/services/firestore.js    Firestore reads and writes
scripts/seedFirestore.js     Firestore seed script
api/index.js                 Vercel serverless Express entry
vercel.json                  Vercel frontend/API routing config
firestore.rules              Firestore security rules
.env.example                 Required environment variables
```
