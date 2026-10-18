import os
from typing import List
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "CyberShield AI"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    
    # Security
    SECRET_KEY: str = os.getenv("SECRET_KEY", "cybershield-super-secret-jwt-key-2026-production-ready")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 120
    
    # Database
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./cybershield.db")
    
    # CORS
    CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:8000",
        "http://127.0.0.1:8000",
    ]
    
    # Configurable Risk Scoring Bands (Presentation Conventions)
    RISK_BAND_LOW_MAX: int = 24
    RISK_BAND_MEDIUM_MAX: int = 49
    RISK_BAND_HIGH_MAX: int = 74
    # 75-100 is Critical
    
    # Upload Limits (in Megabytes)
    MAX_IMAGE_MB: int = 10
    MAX_AUDIO_MB: int = 25
    MAX_VIDEO_MB: int = 50
    
    # External APIs (Optional)
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    GOOGLE_SAFE_BROWSING_KEY: str = os.getenv("GOOGLE_SAFE_BROWSING_KEY", "")
    
    # Demo Account
    DEMO_USER_EMAIL: str = "demo@cybershield.ai"
    DEMO_USER_PASSWORD: str = "CyberShield2026!"
    DEMO_USER_NAME: str = "CyberShield Analyst"
    
    class Config:
        env_file = ".env"
        extra = "allow"

settings = Settings()
