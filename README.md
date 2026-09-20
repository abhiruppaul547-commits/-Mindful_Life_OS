# Mind-Life OS 🌌 (Demo UI Branch)

Welcome to the **Demo UI branch** for the Mind-Life OS. This independent branch is dedicated strictly to showcasing the frontend capabilities, animations, and user experience of the daily time-blocking dashboard.

This branch operates entirely on the client-side (using `localStorage` for state persistence) to provide a friction-free playground for the UI before integrating it with a robust backend architecture in the `main` branch.

## ✨ Features Highlight

This demo includes a fully functional frontend synthesis of a daily protocol dashboard and a master setup wizard.

* **Time-Block Timetable Dashboard:** A dynamic, chronological visualization of daily tasks, categorized by type (Deep Work, Training, Academic, etc.).

* **Real-Time Execution Tracking:** Live countdowns for active blocks, dynamic highlighting of the current task, and a real-time clock synced to the second.

* **Productivity Telemetry:** Live calculation of daily execution scores (0-100%), focus time tracking, and dynamic status labels (e.g., "Peak Execution", "High Velocity Flow").

* **Master Setup Wizard:** A 4-step interactive onboarding flow to configure fixed commitments, training regimens, and circadian recovery blocks, which then auto-synthesizes a 7-day schedule.

* **Immersive UI/UX:** Features a custom HTML5 canvas particle background, glassmorphism UI elements, ambient glows, and fluid micro-interactions powered by Framer Motion.

* **Client-Side Persistence:** Zero-backend setup. All configurations, tasks, and completion states are stored locally in the browser's `localStorage`.

## 🛠️ Tech Stack

This UI demo is built using modern React ecosystem tools:

* **Framework:** React 18

* **Styling:** Tailwind CSS (with `clsx` and `tailwind-merge` for dynamic class resolution)

* **Animations:** Framer Motion

* **Icons:** Lucide React

* **State Management:** React Hooks (`useState`, `useEffect`, `useMemo`) + `localStorage`

## 🚀 Getting Started

Since this is an independent UI demo branch, you can easily spin it up using Vite or Create React App.

### Prerequisites

* Node.js (v16 or higher)

* npm, yarn, or pnpm

### Installation

1. **Clone the repository and checkout this branch:**

   ```
   git clone https://github.com/abhiruppaul547-commits/<your-repo-name>.git
   cd <your-repo-name>
   git checkout <name-of-this-demo-branch>
   
   ```

   *(Note: Replace `<your-repo-name>` and `<name-of-this-demo-branch>` with your actual repository and branch names).*

2. **Install Dependencies:**
   Make sure you have the required UI libraries installed. If you are dropping `BaselineUI.jsx` into a fresh project, install these:

   ```
   npm install framer-motion lucide-react clsx tailwind-merge
   
   ```

   *(Note: Ensure Tailwind CSS is configured in your project).*

3. **Run the Development Server:**

   ```
   npm run dev
   
   ```

4. **View the App:** Open your respective local port in your browser.

## 📂 Code Structure (BaselineUI.jsx)

The entire demo is encapsulated in `BaselineUI.jsx` to make it easily reviewable and portable. It is divided into three main sections:

1. **Utilities & Config:** Helper functions for time math, date formatting, and the default fallback configuration.

2. **`App` / Ambient Background:** The root component managing the view state (Wizard vs. Dashboard) and rendering the HTML5 particle canvas.

3. **`TimeblockTimetableDashboard`:** The core dashboard UI, handling daily task generation, real-time clock intervals, active task detection, and the quick-add modal.

4. **`MasterSetupWizard`:** The multi-step configuration interface for generating the initial schedule payload.

## ⚠️ Notes for this Branch

* **No Database Required:** All data (tasks, configs) uses `localStorage` keys prefixed with `mindfulOS_`. If you want to completely reset the demo, simply clear your browser's local storage or use the "OS Settings" button to re-run the synthesis wizard.

* **Main Branch Context:** This branch is strictly for UI/UX iteration and demonstration. For the full-stack version featuring database integration, user authentication, and backend sync, please refer to the `main` branch.

## 👨‍💻 Author

Developed and maintained by [**abhiruppaul547-commits**](https://github.com/abhiruppaul547-commits?utm_source=gemini).
Feel free to check out my GitHub profile for more projects, open-source contributions, and updates to this repository!
