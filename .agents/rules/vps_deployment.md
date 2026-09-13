---
description: VPS Deployment and Self-Hosting Knowledge for Automate Lead Generation
---

# VPS Deployment Rule & Plan

When the user is ready to deploy or migrate this project to a VPS:
1. Consult [docs/vps_deployment_guide.md](file:///d:/Projects/Automate%20lead%20generation/docs/vps_deployment_guide.md) which contains the complete architecture and step-by-step setup commands.
2. The deployment model:
   - Self-hosted **n8n** in Docker (unlimited executions, zero subscription cost).
   - **FastAPI** backend running with Uvicorn.
   - **React/Vite** compiled to static `dist/` and served via Nginx.
   - **Nginx** handles reverse proxying, WebSockets for n8n, and Let's Encrypt HTTPS.
   - **Supabase Cloud** remains as database/auth.
   - **Apify** handles external Google Maps crawling via API.
3. Assist the user sequentially: Server provisioning -> Docker install -> docker-compose -> Nginx & SSL -> n8n workflow import -> Webhook URL reconfiguration.
