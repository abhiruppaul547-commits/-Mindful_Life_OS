# Mindful Life OS

An intelligent, distraction-free scheduling and execution environment designed to eliminate decision fatigue and optimize your daily routine.

## Overview

Mindful Life OS is not just another calendar app. It is a rigorous, state-aware productivity engine that turns your non-negotiable master schedule into a frictionless, binary to-do list. By leveraging real-time ML logic, it actively adapts to your day, ensuring that you maintain momentum without the psychological burden of constant replanning.

## Tech Stack

- **Frontend:** v0 / Lovable (Engineered for a visually calming, hyper-minimalist, and distraction-free interface).
- **Backend & State Management:** Cursor (Powering the AI-assisted backend logic, real-time ML state management, and seamless system architecture).

## Core Modules

### 1. The Core Foundation: The "Master Setup" & Edit Engine

- **The Master Setup:** A rigorous, one-time onboarding process. Users input their non-negotiable master schedule—including university classes, work shifts, fixed weekly workout splits, and long-term academic goals. The system uses these constraints to generate a personalized baseline weekly template.
- **The Edit Engine:** This template runs on autopilot. If your routine changes, you simply use the "Edit Schedule" feature. The AI instantly rebuilds the recurring to-do list based on the new constraints, eliminating the need to start from scratch.

### 2. Module 1: The Real-Time Checkbox Interface

- **The Interface:** A daily dashboard stripped down to a clean, frictionless binary to-do list (checkboxes) explicitly for your current time blocks. No clutter, no overwhelming lists of future tasks.
- **The Real-Time ML Logic:** AI suggestions act as a live reaction to your checkboxes. If a task remains unchecked when a time block ends, the AI intervenes in real-time. For example, it might suggest pushing a missed coding block to tomorrow to protect a non-negotiable sleep goal.

### 3. Module 2: The Executive Conductor & Notifications

- **Smart Notifications:** The system sends a single, non-overlapping push notification exactly when it is time to transition to the next block on the checklist. This ensures you are never confused or overwhelmed by overlapping tasks.
- **The Unified Dashboard:** A minimalist homepage highlighting _only_ the immediate next checkbox you need to focus on, keeping the psychological burden of decision-making completely off your brain.

### 4. Module 3: "Off-Grid" (Vacation / Holiday Mode)

- **The Feature & Logic:** A simple toggle on the dashboard instantly suspends all push notifications, schedule tracking, and AI suggestions. It pauses the baseline schedule and marks the days as "Holiday," ensuring your long-term execution efficiency score doesn't drop while you take a necessary break.

## Installation

1. Clone the repository:

   ```bash
   git clone [https://github.com/yourusername/mindful-life-os.git](https://github.com/yourusername/mindful-life-os.git)
   ```

Navigate to the project directory:

Bash
cd mindful-life-os
Install dependencies:

Bash
npm install
Configure environment variables:
Create a .env.local file in the root directory and add your required configuration keys.

Run the development server:

Bash
npm run dev
Usage
Onboarding: Launch the app and complete the Master Setup to establish your baseline routine.

Execution: Keep the Unified Dashboard open to focus entirely on your current time block's checkbox.

Adaptation: Let the system's smart notifications and real-time ML logic guide your transitions or reschedule missed blocks.
Rest: Toggle Off-Grid mode whenever you need a break without penalizing your productivity metrics.
License
Distributed under the MIT License. See LICENSE for more information.
