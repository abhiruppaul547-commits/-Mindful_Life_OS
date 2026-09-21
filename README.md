# Mindful Life OS

A calming life-planning and execution system for structuring time, habits, and focus with a minimal, high-clarity interface.

## Current Progress

This repository currently contains the early working UI and authentication foundation for the product.

The active frontend prototype is in the `FOLDER_1_BASIC_UI` app and includes:

- a polished sign-in / create-account screen
- a forgot-password flow
- Firebase Auth integration
- Firebase Firestore readiness for user configuration and task storage
- a dense dashboard interface for time-block planning and daily structure

This is an ongoing product prototype, not a final production deployment.

## What is Working Right Now

### Authentication

- Sign in flow with Firebase Auth
- Create account flow
- Reset password flow using `sendPasswordResetEmail`
- Auth state handling for logged-in vs logged-out users

### Core Product UI

- Minimal, dark visual system
- Productivity dashboard structure
- Weekly scheduling / timetable interface
- Daily planning blocks and habit-focused time management

### Storage Layer

- Firestore integration is set up for user-specific configuration and future app state persistence
- This is intended to support syncing schedule data and user-generated planning data

## Tech Stack

- React
- Vite
- Firebase Authentication
- Firebase Firestore
- Framer Motion
- Tailwind-like utility styling pattern
- Lucide icons

## Project Structure

```text
MINDFUL_LIFE_OS/
├── README.md
├── LICENSE
├── .gitignore
├── FOLDER_1_BASIC_UI/
│   ├── package.json
│   ├── main.jsx
│   ├── BaselineUI.jsx
│   ├── vite.config.js
│   └── src/
├── app/
├── Mindful_Life_OS/
├── ProjectFlow.md
├── demo2UI.jsx
├── icons/
└── UI DESIGN INSPIRATION/
```

## Local Setup

From the project root:

```bash
cd FOLDER_1_BASIC_UI
npm install
npm run dev
```

Then open the local Vite URL shown in the terminal, usually:

```text
http://localhost:4173/
```

## Firebase Note

This repo contains the app code for Firebase-based auth and storage, but production secrets should remain local and private.

Do not commit real Firebase credentials or environment secrets to a public repository. Use local environment variables or a private config file during development.

## Current Product Direction

Mindful Life OS is being built as a focused operational system for personal execution:

- reduce decision fatigue
- protect important routines
- keep the user centered on the next valid action
- unify planning, recovery, and habit structure into one calm interface

## Roadmap

Planned next stages include:

- stronger onboarding setup and personalization
- better user configuration persistence
- reminder and notification flow
- more refined life-block prioritization logic
- expanded productivity analytics and recovery patterns

## License

This project is licensed under the MIT License. See the `LICENSE` file for details.
