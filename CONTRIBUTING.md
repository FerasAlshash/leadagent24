# Contributing to LeadAgent24

Thank you for your interest in contributing to **LeadAgent24**! We welcome contributions to enhance our autonomous B2B lead generation engine, contact enrichment pipelines, and outbound integrations.

---

## 🛠️ Code of Conduct & Standards

To maintain a healthy and welcoming community, please adhere to standard open-source best practices:
- Be respectful and constructive in issues and pull requests.
- Ensure that sensitive keys, credentials, or private environment variables (`.env`) are never committed.
- Keep pull requests focused on specific improvements or fixes rather than massive monolithic updates.

---

## 🚀 Getting Started

1. **Fork the Repository:** Create your own fork of `leadagent24` on GitHub.
2. **Clone your fork locally:**
   ```bash
   git clone https://github.com/your-username/leadagent24.git
   cd leadagent24
   ```
3. **Create a Feature Branch:**
   ```bash
   git checkout -b feature/your-feature-name
   # or for fixes/documentation
   git checkout -b docs/clarify-deployment
   ```

---

## 💻 Development Workflow

### Frontend (React 19 + Vite + Tailwind CSS)
```bash
# Install dependencies
npm install

# Start local development server
npm run dev
```

### Backend (FastAPI + Python 3.12)
```bash
cd backend
python -m venv venv

# Windows
.\venv\Scripts\activate
# Linux/macOS
source venv/bin/activate

pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

---

## 📝 Commit Message Guidelines

We follow standard conventional commits for clean history:
- `feat:` A new feature or capability.
- `fix:` A bug fix.
- `docs:` Documentation updates or clarifications.
- `chore:` Maintenance, dependency updates, or gitignore adjustments.
- `refactor:` Code refactoring without behavioral changes.

---

## 📬 Submitting a Pull Request

1. Ensure your branch is clean and up to date with `main`.
2. Push your branch to your fork on GitHub:
   ```bash
   git push origin feature/your-feature-name
   ```
3. Open a Pull Request from your branch against the `main` branch of `FerasAlshash/leadagent24`.
4. Provide a clear summary and description of the changes in the PR template.

Thank you for helping make LeadAgent24 better!
