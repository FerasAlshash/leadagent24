# Project Memory & Knowledge Base (AGENTS.md)

## 1. Project Overview
- **Project Name:** Automate Lead Generation SaaS
- **Stack:**
  - **Frontend:** React 19 + Vite + Tailwind CSS + Vanilla CSS tokens.
  - **Backend:** FastAPI (Python 3.12, Uvicorn) with routers for leads, campaigns, webhooks, auth, and analytics.
  - **Database & Auth:** Supabase (PostgreSQL, Supabase Auth, Row Level Security).
  - **Workflow Engine:** n8n (`n8n-workflow-updated.json`) running webhook `lead-machine`.
  - **Scraper:** Apify Google Places Crawler (`compass~crawler-google-places`) with `scrapeContacts: true`.
  - **Comprehensive Documentation & Roadmap:** [docs/project_overview_and_roadmap.md](file:///d:/Projects/Automate%20lead%20generation/docs/project_overview_and_roadmap.md).

---

## 2. Long-Term Roadmap & VPS Deployment Knowledge
Whenever the user requests moving/hosting the project on a **VPS**:
- Refer immediately to the complete guide: [docs/vps_deployment_guide.md](file:///d:/Projects/Automate%20lead%20generation/docs/vps_deployment_guide.md).
- **Target Server:** Ubuntu 22.04/24.04 (recommended: Hetzner CX22/CX32 with 2 vCPU, 4GB RAM).
- **Orchestration:**
  - Run **n8n** self-hosted using official Docker image (`docker.n8n.io/n8nio/n8n`).
  - Run **FastAPI** backend via Docker or systemd on port 8000.
  - Serve **React** production build (`dist/`) directly through **Nginx**.
  - **Nginx Reverse Proxy** manages subdomains (e.g., `app.yourdomain.com` and `workflow.yourdomain.com`) with automatic Let's Encrypt SSL.
  - **Supabase Cloud** remains as database and auth provider.
  - **Apify API** continues running the Google Places actor triggered by n8n.
- **Workflow Execution:**
  - Guide the user step-by-step through server provisioning, Docker installation, reverse proxy configuration, SSL setup, workflow import, and webhook verification.

---

## 3. UI/UX & Style Rules
- Language: Assistant communicates with user in Arabic; application UI is in English.
- Dark/Light Theme: Emerald accents (`text-emerald-600`, `bg-emerald-50`, `border-emerald-200`) with sleek slate backgrounds.
- Outbound Cold Mail Status: Database values are `'✅'`, `'Sent'`, or timestamp `SEND_Time`. UI badges display cleanly as `Sent` (with `<CheckCircle2 />` SVG icon), omitting the literal emoji for SaaS polish.
- Email Preview: Always render the `Preview` button on the exact same row level as `Verified` and `Sent`, disabled if no email is present.
