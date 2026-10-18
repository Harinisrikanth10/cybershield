import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Integer, Float, DateTime, ForeignKey, JSON, Text
from sqlalchemy.orm import relationship
from app.db.session import Base

class AnalysisRecord(Base):
    __tablename__ = "analysis_records"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    
    # url, text, image, audio, video
    submission_type = Column(String(20), nullable=False, index=True)
    target_summary = Column(String(255), nullable=False)
    raw_input_preview = Column(Text, nullable=True)
    
    # 0 - 100
    risk_score = Column(Integer, nullable=False, index=True)
    # Low, Moderate, High, Critical
    risk_category = Column(String(20), nullable=False, index=True)
    # 0.0 - 1.0 (calibrated confidence or uncertainty score)
    confidence_score = Column(Float, nullable=False, default=0.85)
    
    # completed, limited, failed
    status = Column(String(20), nullable=False, default="completed")
    
    # Structured transparent data
    findings_json = Column(JSON, nullable=False, default=list)
    evidence_json = Column(JSON, nullable=False, default=list)
    limitations_json = Column(JSON, nullable=False, default=list)
    recommendations_json = Column(JSON, nullable=False, default=list)
    model_info_json = Column(JSON, nullable=False, default=dict)
    
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False, index=True)

    user = relationship("User", back_populates="analyses")
    alerts = relationship("Alert", back_populates="analysis", cascade="all, delete-orphan")
