# LeadAgent SaaS — Architecture, Overview & Strategic Roadmap
### Autonomous B2B Lead Generation, Deep Contact Enrichment & AI Cold Outreach

---

## 1. Project Overview & Mission

**LeadAgent** is an enterprise-grade, full-stack **B2B SaaS platform** engineered to solve the most labor-intensive and costly bottleneck in sales development: **manual prospecting and cold email outreach**.

Rather than spending hours manually searching Google Maps, copying phone numbers, hunting for verified executive inboxes across corporate websites, and writing individual pitch emails, LeadAgent transforms this entire pipeline into an **Autonomous Outbound Machine**:
1. **Target Definition:** Users specify their desired business niche, geographical market (city, country), and lead target volume.
2. **Autonomous Extraction & Verification:** The system crawls Google Places, visits corporate websites to extract primary inboxes (`info@`, `contact@`, `sales@`), phone numbers, and official social media handles (LinkedIn, Instagram, Facebook), filtering out generic noise.
3. **AI Copywriting & Multi-Provider Dispatch:** Automatically synthesizes high-converting, personalized cold pitch emails and dispatches them through the user's configured email infrastructure (Resend, Brevo, SendGrid, or Custom SMTP).
4. **Interactive Command Center:** Provides real-time campaign oversight, an interactive email preview modal, audit logging, and delivery analytics.

---

## 2. Multi-Tenant SaaS Architecture

LeadAgent is architected from the ground up as a scalable, subscription-ready commercial SaaS:
- **Workspace Multi-Tenancy:** Each customer operates within an isolated workspace with dedicated campaigns, credentials, and prospect records.
- **Row-Level Security (RLS):** Governed by Supabase PostgreSQL RLS policies ensuring strict data segregation across tenant boundaries.
- **Role-Based Authentication & Profiles:** Secure authentication via Supabase Auth (JWT bearer sessions), password validation, and a dedicated **Admin Console** for platform health monitoring.
- **Cloud & Self-Hosting Flexibility:** Designed for seamless deployment on standard Ubuntu VPS servers (Hetzner, DigitalOcean) using Docker Compose, Nginx reverse proxy, and Let's Encrypt SSL.

---

## 3. End-to-End Pipeline Architecture

```text
 ┌──────────────────────────────────────────────────────────┐
 │ 1. React 19 Frontend Dashboard                           │
 │ User specifies: Target Niche (e.g. Clinics) + City (e.g. Dubai) │
 └────────────────────────────┬─────────────────────────────┘
                              │ HTTPS / JWT Bearer
                              ▼
 ┌──────────────────────────────────────────────────────────┐
 │ 2. FastAPI Backend & Pre-Flight Validation               │
 │ - Validates campaign parameters & sender credentials     │
 │ - Dispatches launch payload to workflow webhook          │
 └────────────────────────────┬─────────────────────────────┘
                              │ Webhook Payload
                              ▼
 ┌──────────────────────────────────────────────────────────┐
 │ 3. n8n Automation Engine                                 │
 │ Orchestrates crawler agents and enrichment tasks         │
 └────────────────────────────┬─────────────────────────────┘
                              │ API Trigger
                              ▼
 ┌──────────────────────────────────────────────────────────┐
 │ 4. Apify Cloud Crawler (compass~crawler-google-places)   │
 │ - Scrapes targeted businesses & Google Maps metadata     │
 │ - Deep-crawls corporate websites for emails & socials    │
 └────────────────────────────┬─────────────────────────────┘
                              │ Raw Crawled Data
                              ▼
 ┌──────────────────────────────────────────────────────────┐
 │ 5. AI Information Extraction & Email Generation          │
 │ - Cleans, prioritizes, and verifies contact inboxes      │
 │ - Crafts tailored pitch emails matching selected tone    │
 └────────────────────────────┬─────────────────────────────┘
                              │ Verified Prospect Payload
                              ▼
 ┌──────────────────────────────────────────────────────────┐
 │ 6. Outbound Dispatch & Database Registration             │
 │ - Sends email via campaign's configured provider         │
 │ - Stores records in Supabase PostgreSQL (leads table)    │
 │ - Real-time UI synchronization via database polling      │
 └──────────────────────────────────────────────────────────┘
```

---

## 4. Current Core Capabilities

### 1. Geospatial & B2B Lead Discovery
- High-precision search across global cities, categories, and business types.
- Scrapes verified names, phone numbers, complete street addresses, average ratings, and review counts.

### 2. Deep Multi-Channel Contact Enrichment
- Automatically crawls business websites to discover official departmental email addresses.
- Extracts official social media profiles (**LinkedIn**, **Instagram**, **Facebook**) for multi-touch follow-ups.

### 3. Per-Campaign Outbound Email Infrastructure (BYOK Vault)
- **Bring Your Own Key (BYOK):** Dedicated outbound email settings per campaign supporting **Resend**, **Brevo**, **SendGrid**, and **Custom SMTP**.
- **Secure Key Vault:** Encrypted credential storage with live API key and SMTP connection testing (`Test Email Connection`).
- **Domain Verification Guidance:** Interactive diagnostics modal providing step-by-step SPF, DKIM, and DMARC verification instructions.

### 4. Pre-Flight Launch Protection
- Outbound prospecting searches are automatically safeguarded: searches cannot be initiated without an active, verified email provider, preventing failed delivery attempts.

### 5. Real-Time Prospecting Milestone Tracker
- Live modal monitoring the 4 key discovery stages:
  1. **Locating Businesses** (Google Places crawler)
  2. **Enriching Contacts** (Website scraping for emails & socials)
  3. **Crafting Personalized AI Emails** (Dynamic copywriting)
  4. **Finalizing & Saving Prospects** (PostgreSQL registration)
- Uses real-time database polling instead of arbitrary timeouts, supporting background minimization while jobs run.

### 6. Unified 5-Tone Copywriting Engine
- Standardized cold outreach styles available across creation, settings, and prospecting dispatch:
  - **Professional** (`Recommended`) — Corporate, ROI-focused
  - **Casual** (`High Engagement`) — Warm, conversational
  - **Urgent** (`Fast Read`) — Direct, action-driven
  - **Consultative** (`Advisory`) — Partnership & value-first
  - **Creative** (`Standout`) — Punchy, memorable pitch

### 7. Interactive Sent Email Preview Modal
- Inspect exact subject lines, email bodies, dispatch timestamps, and status badges (`Sent` / `Verified`) directly from the campaign leads table.
- One-click copy for subject lines and email bodies.

### 8. Analytics & Audit Telemetry
- Real-time KPI cards: **Email Discovery Rate**, **Outreach Dispatch Rate**, and **Total Leads Acquired**.
- Chronological, searchable transaction audit log tracking all scraping, enrichment, and dispatch events.

---

## 5. Strategic Development Roadmap

```text
 ┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
 │     PHASE 1     │     │     PHASE 2     │     │     PHASE 3     │     │     PHASE 4     │
 │  BYOK & Vault   │ ──► │  Domain Health  │ ──► │ Drip Sequences  │ ──► │  Monetization   │
 │   [COMPLETED]   │     │   & Rotation    │     │ & AI Classifier │     │  & Public API   │
 └─────────────────┘     └─────────────────┘     └─────────────────┘     └─────────────────┘
```

### ✅ Phase 1: Bring Your Own Email (BYOK) & Key Vault (COMPLETED)
- [x] Per-campaign email provider configuration (Resend, Brevo, SendGrid, Custom SMTP).
- [x] Secure multi-tenant credential vault with real-time test connection diagnostics.
- [x] Pre-flight launch protection preventing unconfigured prospecting runs.
- [x] Unified 5-style copywriting tone selection across all platform views.
- [x] Real-time prospecting milestone tracker with live database polling.
- [x] In-app custom confirmation modals replacing disruptive browser alerts.

---

### 🔄 Phase 2: Domain Health, Warm-Up & Inbox Rotation (IN PROGRESS)
- **Multi-Inbox Rotation:** Distribute outbound sending across multiple sender addresses under the same domain to preserve sender reputation.
- **Daily Dispatch Velocity Throttles:** Configurable sending caps (e.g., 50 emails/day per inbox) to prevent domain blacklisting.
- **Automated DNS Health Validator:** Real-time query tools verifying **SPF**, **DKIM**, and **DMARC** DNS records prior to campaign execution.
- **Google Workspace & Microsoft 365 Direct OAuth:** Direct OAuth 2.0 connection enabling sales representatives to send emails directly through their native Gmail or Outlook accounts.

---

### ⏳ Phase 3: Automated Drip Sequences & AI Engagement Intelligence
- **Multi-Step Drip Sequences:**
  - Initial outreach on Day 1.
  - Automated condition-based follow-up on Day 4 if no response is detected.
  - Final breakup email on Day 8.
- **Real-Time Engagement Tracking:** Webhook receivers tracking email opens and link click-through rates.
- **AI Sentiment & Reply Classifier:**
  - Automatically parses inbound prospect replies: *Interested*, *Meeting Requested*, *Not Interested*, or *Wrong Contact*.
  - Real-time notifications via **Slack** and **Telegram** webhooks when a positive lead response is detected.

---

### ⏳ Phase 4: Monetization, CRM Ecosystem & Developer API
- **Subscription Billing & Quotas:** Integrated **Stripe** or **LemonSqueezy** subscription tiers (e.g., Starter: 1,000 leads/mo, Pro: 5,000 leads/mo, Enterprise: unlimited).
- **One-Click CRM Synchronization:** Native export to **HubSpot**, **Salesforce**, **Pipedrive**, or **Google Sheets**.
- **Public Developer REST API:** API key-authenticated endpoints enabling external platforms to initiate lead generation and query enrichment data programmatically.

---

## 6. Commercial Value Proposition

LeadAgent is not merely a scraping utility—it is an **All-in-One Autonomous Sales Machine**. By unifying geospatial discovery, deep website contact enrichment, generative AI copywriting, and direct cold email dispatch into a single cohesive SaaS workspace, it eliminates the need for fragmented, expensive sales development tool stacks.
