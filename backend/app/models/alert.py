import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.db.session import Base

class Alert(Base):
    __tablename__ = "alerts"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    analysis_id = Column(String(36), ForeignKey("analysis_records.id", ondelete="CASCADE"), nullable=True, index=True)
    
    title = Column(String(255), nullable=False)
    message = Column(String(1000), nullable=False)
    # low, medium, high, critical
    severity = Column(String(20), nullable=False, default="high", index=True)
    is_read = Column(Boolean, default=False, nullable=False, index=True)
    
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False, index=True)

    user = relationship("User", back_populates="alerts")
    analysis = relationship("AnalysisRecord", back_populates="alerts")
