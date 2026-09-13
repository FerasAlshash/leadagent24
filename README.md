# LeadAgent — Autonomous B2B Lead Generation & AI Outreach Platform

[![React 19](https://img.shields.io/badge/React-19.0-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-6.0-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![Python](https://img.shields.io/badge/Python-3.12-3776AB?logo=python&logoColor=white)](https://www.python.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?logo=supabase&logoColor=white)](https://supabase.com/)
[![n8n](https://img.shields.io/badge/Workflow-n8n-EA4B71?logo=n8n&logoColor=white)](https://n8n.io/)

A modern, full-stack B2B SaaS platform that automates the entire outbound sales prospecting cycle: geospatial business discovery, deep contact enrichment (Verified Emails, Phone Numbers, LinkedIn, Instagram, Facebook), AI data cleaning, and personalized cold email outreach.

---

## 🌟 Key Features

- **Geospatial & B2B Lead Scraper:** Target businesses by industry, location, and volume using high-speed crawlers.
- **Deep Contact Enrichment:** Scrapes corporate websites to extract primary business email addresses, direct phone numbers, and official social media handles.
- **AI Data Extraction & Verification:** Evaluates discovered emails and prioritizes departmental inboxes (`info@`, `contact@`, `sales@`) over generic noise.
- **Personalized Outbound Outreach:** Generates tailored cold pitch emails and dispatches them automatically through workflow pipelines.
- **Interactive Email Preview Modal:** Inspect exact outbound subject lines, email bodies, dispatch timestamps, and status badges directly within campaign workspaces.
- **Interactive Analytics Dashboard:** Real-time metrics grid tracking discovery rates, dispatch percentages, and conversion timelines.
- **Live Event Audit Feed:** Chronological transaction log recording every search, extraction, and outbound communication event.
- **Multi-Tenant Security:** Powered by Supabase Auth and PostgreSQL Row Level Security (RLS) for complete workspace isolation.

---

## 🏗️ System Architecture

```text
                           [ Client Browser ]
                                   │
                                   ▼
                    [ React 19 Frontend (Vite) ]
                                   │
             ┌─────────────────────┴─────────────────────┐
             ▼                                           ▼
   [ FastAPI Backend ]                           [ n8n Automation Engine ]
   (Port 8000 REST API)                         (Webhook: lead-machine)
             │                                           │
             │                                           ▼
             │                                   [ Apify Cloud API ]
             │                               (compass~crawler-google-places)
             ▼                                           │
   [ Supabase PostgreSQL ] ◄─────────────────────────────┘
  (Auth, RLS, Realtime DB)
```

---

## 📂 Project Structure

```text
automate-lead-generation/
├── backend/                   # FastAPI application
│   ├── routers/               # API endpoints (leads, campaigns, auth, admin)
│   ├── config.py              # Environment configuration & settings
│   ├── database.py            # Supabase client integration
│   ├── main.py                # Application entrypoint & CORS middleware
│   ├── requirements.txt       # Python dependencies
│   └── .env.example           # Backend environment template
├── docs/                      # Architectural documentation
│   ├── project_overview_and_roadmap.md  # Deep dive & future milestones
│   └── vps_deployment_guide.md          # Docker, Nginx, and VPS setup
├── public/                    # Static assets & icons
├── src/                       # React frontend source code
│   ├── assets/                # Images & SVGs
│   ├── components/            # UI components (modals, tables, analytics)
│   ├── context/               # Authentication & global application state
│   ├── lib/                   # Supabase client setup
│   ├── pages/                 # Route pages (Dashboard, Campaigns, Audit Log)
│   └── utils/                 # Validation & string parsers
├── .env.example               # Frontend environment template
├── .gitignore                 # Protected secrets & artifact exclusion rules
├── package.json               # Node.js dependencies & scripts
├── tailwind.config.js         # Design system & color tokens
└── vite.config.js             # Build & bundler configuration
```

---

## 🚀 Quick Start (Local Development)

### Prerequisites
- **Node.js** v18.0 or higher
- **Python** v3.11 or v3.12
- **Supabase** account (Free tier supported)

---

### 1. Environment Configuration

#### Frontend Environment:
Create a `.env` file in the project root:
```bash
cp .env.example .env
```
Edit `.env`:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

#### Backend Environment:
Create a `.env` file inside the `backend/` directory:
```bash
cp backend/.env.example backend/.env
```
Edit `backend/.env`:
```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
N8N_WEBHOOK_URL=https://workflow.yourdomain.com/webhook/lead-machine
FRONTEND_URL=http://localhost:5173
PORT=8000
```

---

### 2. Frontend Setup

```bash
# Install dependencies
npm install

# Start local development server
npm run dev
```
The application will be accessible at `http://localhost:5173`.

---

### 3. Backend Setup

```bash
# Navigate to backend and install requirements
pip install -r backend/requirements.txt

# Start the FastAPI server
python -m uvicorn backend.main:app --host 127.0.0.1 --port 8000 --reload
```
API documentation and Swagger UI will be available at `http://127.0.0.1:8000/docs`.

---

### 4. Workflow Engine (n8n) Setup
1. Launch or self-host your n8n workflow engine instance.
2. Configure a webhook node to listen on `/webhook/lead-machine`.
3. Provide the webhook URL in `backend/.env` under `N8N_WEBHOOK_URL`.

---

## 📖 Deployment & Documentation

- 🚀 **[VPS Deployment Guide](docs/vps_deployment_guide.md):** Complete walkthrough for deploying on Ubuntu using Docker Compose, Nginx reverse proxy, and Let's Encrypt SSL.
- 📋 **[Project Overview & Roadmap](docs/project_overview_and_roadmap.md):** Architectural specifications, feature breakdown, and upcoming expansion milestones (SendGrid, SES, Mailgun, and custom domain email rotation).

---

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.
