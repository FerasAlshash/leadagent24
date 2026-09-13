# Automate Lead Generation SaaS Platform

A modern, full-stack B2B SaaS platform that autonomously prospects leads, enriches contact details (Email, Phone, LinkedIn, Instagram, Facebook), validates records, and dispatches personalized AI cold outreach emails.

---

## 📚 Project Documentation & Guides
- 📖 **[Project Overview, Architecture & Roadmap (الشرح الشامل للمشروع ورؤية التطوير)](file:///d:/Projects/Automate%20lead%20generation/docs/project_overview_and_roadmap.md)**
- 🚀 **[VPS Deployment & Self-Hosting Guide (دليل استضافة النظام على السيرفر الخاص)](file:///d:/Projects/Automate%20lead%20generation/docs/vps_deployment_guide.md)**
- 🧠 **[Agents Knowledge Base & Permanent Memory](file:///d:/Projects/Automate%20lead%20generation/AGENTS.md)**

---

## 🛠 Tech Stack
- **Frontend:** React 19, Vite, Tailwind CSS, Lucide React Icons.
- **Backend:** FastAPI (Python 3.12, Uvicorn) with REST endpoints.
- **Workflow & AI Engine:** n8n (`n8n-workflow-updated.json`).
- **Scraper:** Apify Google Places Crawler (`compass~crawler-google-places`).
- **Database & Auth:** Supabase (PostgreSQL, Auth, Row Level Security).

---

## 🚀 Quick Start (Local Development)

### 1. Frontend:
```bash
npm install
npm run dev
```

### 2. Backend:
```bash
python -m uvicorn backend.main:app --host 127.0.0.1 --port 8000 --reload
```
