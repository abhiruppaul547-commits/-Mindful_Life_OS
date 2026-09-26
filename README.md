# Mindful Life OS

An intelligent, distraction-free scheduling and execution environment designed to eliminate decision fatigue and optimize your daily routine.

## Overview

Mindful Life OS is not just another calendar app. It is a rigorous, state-aware productivity engine that turns your non-negotiable master schedule into a frictionless, binary to-do list. By leveraging real-time ML logic and structured time-blocking, it actively adapts to your day, ensuring that you maintain momentum without the psychological burden of constant replanning.

## Current Progress & Features

The application is fully powered by React, Vite, Tailwind CSS, and Firebase:

- **Authentication**: Seamless email/password Sign In, Account Creation, Password Recovery with Firebase Auth, and persistent session state.
- **Master Setup Wizard**: Interactive onboarding engine to configure university/work commitments, workout splits, and sleep/recovery parameters synced to Cloud Firestore.
- **Real-Time Checkbox Dashboard**: Live daily timetable with focus metrics, Pomodoro timer, progress tracking, and block completion.
- **State & Cloud Storage**: Cloud Firestore integration for user configuration (`users/{uid}/config/main`) and daily tasks persistence.
- **Production-Ready**: Multi-tier code-splitting, Tailwind CSS v4 pipeline, and native compatibility with Vercel and Netlify.

## Tech Stack

- **Frontend:** React 19, Vite, Tailwind CSS v4, Framer Motion, Lucide Icons
- **Backend & Auth:** Firebase Authentication, Cloud Firestore
- **Deployment:** Vercel / Netlify

## Project Structure

```text
MINDFUL_LIFE_OS/
├── package.json         # Root workspace scripts (build, dev, preview)
├── vercel.json           # Vercel deployment configuration & SPA rewrites
├── netlify.toml          # Netlify build and redirect configuration
├── .env.example          # Environment variables template
├── app/                  # Main production Vite React application
│   ├── package.json
│   ├── vite.config.js
│   ├── index.html
│   ├── public/
│   │   ├── favicon.svg
│   │   └── icons/
│   └── src/
│       ├── App.jsx
│       ├── BaselineUI2.jsx
│       ├── firebase.js
│       └── index.css
├── FOLDER_1_BASIC_UI/   # UI exploration and component prototyping
└── UI DESIGN INSPIRATION/
```

## Local Development Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/abhiruppaul547-commits/-Mindful_Life_OS.git
   cd -Mindful_Life_OS
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Copy `.env.example` to `app/.env` (or `.env.local`):
   ```bash
   cp .env.example app/.env.local
   ```
   Add your Firebase credentials:
   ```env
   VITE_FIREBASE_API_KEY=your_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   ```

4. **Run the development server:**
   ```bash
   npm run dev
   ```

5. **Build for production:**
   ```bash
   npm run build
   npm run preview
   ```

## Production Deployment

### Deploying to Vercel
1. Import the repository into your Vercel dashboard.
2. Root Directory: leave as default `./` (or specify `app`).
3. Add the environment variables from `.env.example` under **Settings > Environment Variables**.
4. Deploy!

### Deploying to Netlify
1. Connect the repository to Netlify.
2. The included `netlify.toml` will automatically configure the base directory (`app`), build command (`npm run build`), and publish directory (`dist`).
3. Add the environment variables under **Site configuration > Environment variables**.
4. Deploy!

## License

Distributed under the MIT License. See [LICENSE](file:///LICENSE) for more information.
