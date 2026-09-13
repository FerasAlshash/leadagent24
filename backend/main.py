from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.routers import auth, campaigns, leads, admin

app = FastAPI(
    title="Lead Machine SaaS API",
    description="Multi-tenant Cold Outreach & B2B Lead Generation Backend",
    version="1.0.0"
)

# Enable CORS for Vite frontend
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "*"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount Routers
app.include_router(auth.router)
app.include_router(campaigns.router)
app.include_router(leads.router)
app.include_router(admin.router)

@app.get("/")
def root():
    return {
        "status": "online",
        "service": "Lead Machine SaaS API",
        "docs": "/docs",
        "version": "1.0.0"
    }

@app.get("/api/health")
def health_check():
    return {"status": "healthy"}
