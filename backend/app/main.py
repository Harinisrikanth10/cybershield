from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from app.core.config import settings
from app.db.session import SessionLocal
from app.db.init_db import init_db
from app.api.router import api_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize database tables and seed realistic demo data
    db = SessionLocal()
    try:
        init_db(db)
    finally:
        db.close()
    yield

app = FastAPI(
    title=f"{settings.PROJECT_NAME} — Threat Detection & Digital Safety API",
    version=settings.VERSION,
    description="Production-ready FastAPI backend for CyberShield AI providing URL analysis, text inspection, media forensics, AI security consultation, and interactive cybersecurity learning.",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_origin_regex=r"https?://(localhost|127\.0\.0\.1)(:\d+)?",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Master API Router
app.include_router(api_router)

@app.get("/api/health", tags=["Health"])
def health_check():
    return {
        "status": "healthy",
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "database": "connected",
        "ssrf_protection": "active",
        "rate_limiting": "active",
    }

@app.get("/", tags=["Root"])
def root():
    return {
        "product": "CyberShield AI",
        "title": "CyberShield AI — Intelligent Threat Detection & Digital Safety Platform",
        "tagline": "Detect Threats. Understand Risks. Stay Protected.",
        "api_docs": "/docs",
        "health": "/api/health",
    }
