# CatchUp Backend

[![Node.js](https://img.shields.io/badge/Node.js-43853D?style=flat&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express.js-404D59?style=flat&logo=express&logoColor=white)](https://expressjs.com/)
[![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=flat&logo=supabase&logoColor=white)](https://supabase.io/)

This is the Node.js/Express backend API for **CatchUp**, a social health and fitness tracking application. 

It acts as the central hub for processing Apple Health data (via iOS Shortcuts), generating automated PDF health reports, communicating with the Groq Llama 3 AI assistant, and managing secure email dispatch via Resend.

## Key Features

* **Apple Health Integration (Web-Native):** Provides the webhook endpoint (`/api/wearables/manual-sync/:uid`) that catches background data payloads sent directly from the user's iPhone via our custom Apple Shortcut.
* **Automated Medical Reports:** Uses `PDFKit` to generate clean, formatted, downloadable PDF summaries of a user's vital signs, activity, and calculated Health Score.
* **AI Health Assistant Endpoint:** Securely routes user queries to the Groq Cloud API (Llama 3 70B model) to provide instant, motivating health advice.
* **Secure Email Dispatch:** Integrates with the `Resend` HTTPS API to send users the necessary setup guides and tracking shortcut links.
* **CORS Secured:** Strict origin policies ensure only the official CatchUp frontend domains can communicate with the database.

## Tech Stack

* **Runtime:** Node.js
* **Framework:** Express.js
* **Database Client:** `@supabase/supabase-js`
* **PDF Generation:** `pdfkit`
* **Email API:** `resend`
* **External Requests:** `axios`

---

## Getting Started

Follow these instructions to set up the CatchUp backend on your local machine.

### Prerequisites

* [Node.js](https://nodejs.org/en/download/) (v16 or higher)
* A [Supabase](https://supabase.com/) project (URL and Anon Key)
* A [Groq](https://groq.com/) API Key
* A [Resend](https://resend.com/) API Key

### 1. Clone the repository

```bash
git clone [https://github.com/yourusername/catchup.git](https://github.com/yourusername/catchup.git)
cd catchup/backend
