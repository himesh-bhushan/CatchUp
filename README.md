# CatchUp: Social Health & Fitness Tracker

[![React](https://img.shields.io/badge/React-20232A?style=flat&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-43853D?style=flat&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=flat&logo=supabase&logoColor=white)](https://supabase.io/)

CatchUp is an open-source, full-stack health tracking application designed to provide users with a comprehensive and social view of their wellness. It syncs seamlessly with Apple Health via custom iOS Shortcuts to track steps, calories, sleep, and heart rate without needing a native iOS app wrapper. 

## Key Features

* **Seamless Apple Health Sync:** Uses a custom iOS Shortcut to automatically push background health data to the server.
* **Automated Health Score:** A dynamic algorithm that calculates a daily score (0-100) based on heart rate, sleep quality, active calories, and hydration.
* **Social Leaderboards & Sharing:** Add friends, compare daily scores, view weekly progress rings, and motivate each other.
* **Dynamic Achievement System:** Earn monthly badges and milestone awards (e.g., 5-day streaks) with native social sharing capabilities.
* **Medical PDF Export:** Instantly generate clean, printable PDF reports of vital signs and health history using PDFKit.
* **AI Health Assistant:** Integrated Groq Llama 3 chatbot for quick, motivating health advice.

## Tech Stack

* **Frontend:** React.js, React Router, Axios, CSS3
* **Backend:** Node.js, Express.js, PDFKit, Resend (Email APIs)
* **Database & Auth:** Supabase (PostgreSQL, Row Level Security, Storage)
* **AI:** Groq Cloud (Llama 3 70B)

---

## Repository Structure

This repository is containing the main web application, the backend API server, and the static company landing page.

```text
catchup/
├── catchup-frontend/          # React.js web application (Dashboard, Sharing, Awards)
├── catchup-backend/           # Node.js/Express API (PDFs, Sync endpoints, AI Chat)
├── catchup-company-website/   # Static landing page (Company/Marketing site)
└── README.md 
