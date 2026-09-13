# VPS Deployment Guide & Architecture Roadmap
**Project:** Automate Lead Generation SaaS & Workflow System
**Components:** React (Vite) + FastAPI (Python) + Self-Hosted n8n + Supabase + Apify

---

## 1. System Architecture Overview
```text
                         [ Users & Browsers ]
                                  │
                                  ▼
                   [ Nginx Reverse Proxy / HTTPS ]
                    (Automatic Let's Encrypt SSL)
                                  │
        ┌─────────────────────────┼─────────────────────────┐
        ▼                         ▼                         ▼
 [React Frontend]         [FastAPI Backend]          [Self-Hosted n8n]
   Port 80/443              Port 8000                 Port 5678
  (Built dist/)          (/api/campaigns...)       (Webhook: lead-machine)
                                  │                         │
                                  │                         ▼
                                  │                  [Apify Cloud API]
                                  ▼                (compass~crawler-places)
                        [Supabase Database]
```

---

## 2. Recommended VPS Specifications
- **Provider Recommendation:**
  - **Hetzner Cloud** (e.g. CX22 / CX32: 2 vCPU, 4 GB RAM) ~ €4 - €6 / month.
  - **DigitalOcean / Linode / Vultr:** (2 vCPU, 4 GB RAM) ~ $12 - $20 / month.
  - **Contabo:** (Cloud VPS S: 4 vCPU, 8 GB RAM) ~ €5 - €7 / month.
- **Operating System:** Ubuntu 22.04 LTS or 24.04 LTS (x86_64).
- **Minimum Specs:** 2 vCPU, 4 GB RAM (with 2GB Swap), 40 GB SSD.

---

## 3. Step-by-Step Deployment Execution Plan

### Step 1: Server Initialization & Security
1. Update packages: `sudo apt update && sudo apt upgrade -y`
2. Configure UFW firewall (allow SSH, HTTP, HTTPS):
   ```bash
   sudo ufw allow OpenSSH
   sudo ufw allow 80/tcp
   sudo ufw allow 443/tcp
   sudo ufw enable
   ```
3. Install Docker and Docker Compose:
   ```bash
   curl -fsSL https://get.docker.com -o get-docker.sh && sh get-docker.sh
   sudo usermod -aG docker $USER
   sudo apt install docker-compose-plugin -y
   ```

### Step 2: Docker Compose Setup (`docker-compose.yml`)
Create a root orchestration file for running **n8n** and **FastAPI** together:
```yaml
version: '3.8'

services:
  n8n:
    image: docker.n8n.io/n8nio/n8n:latest
    restart: always
    ports:
      - "127.0.0.1:5678:5678"
    environment:
      - N8N_HOST=workflow.yourdomain.com
      - N8N_PORT=5678
      - N8N_PROTOCOL=https
      - NODE_ENV=production
      - WEBHOOK_URL=https://workflow.yourdomain.com/
      - GENERIC_TIMEZONE=Europe/Berlin
    volumes:
      - n8n_data:/home/node/.n8n

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    restart: always
    ports:
      - "127.0.0.1:8000:8000"
    env_file:
      - ./backend/.env

volumes:
  n8n_data:
```

### Step 3: Frontend Build & Static Serving
1. Run local or remote build:
   ```bash
   npm install
   npm run build
   ```
2. The generated `dist/` folder contains pure optimized static HTML, CSS, and JS.
3. Nginx serves `dist/` directly with high caching performance and Gzip compression.

### Step 4: Nginx Reverse Proxy & Domain Routing
Configure `/etc/nginx/sites-available/lead_machine`:
```nginx
# 1. Main SaaS Application & API
server {
    server_name app.yourdomain.com;

    root /var/www/lead-machine/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api/ {
        proxy_pass http://127.0.0.1:8000/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

# 2. Self-Hosted n8n & Webhooks
server {
    server_name workflow.yourdomain.com;

    location / {
        proxy_pass http://127.0.0.1:5678;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

### Step 5: Free SSL Certificates (HTTPS)
Run Certbot to secure all domains automatically:
```bash
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d app.yourdomain.com -d workflow.yourdomain.com
```

### Step 6: Importing the Workflow & Connecting Services
1. Log into your self-hosted n8n instance at `https://workflow.yourdomain.com`.
2. Import the existing workflow file: `n8n-workflow-updated.json`.
3. In the Webhook node, the production webhook URL will be:
   `https://workflow.yourdomain.com/webhook/lead-machine`
4. Update the webhook URL inside your project's `.env` or FastAPI config so the frontend/backend calls your server directly.
5. In n8n, set your Apify API Token (`apify_api_...`) and Supabase credentials.

---

## 4. Maintenance & Backups
- **n8n Database & Workflows:** Stored in the Docker volume `n8n_data` (can be backed up with a simple `tar` cron job).
- **Supabase:** Hosted securely in Supabase Cloud with continuous backups.
- **Apify:** Managed scraper runs seamlessly via API.
