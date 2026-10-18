from datetime import datetime
from typing import List, Dict, Any, Optional
from pydantic import BaseModel, HttpUrl, Field

class UrlAnalysisRequest(BaseModel):
    url: str = Field(..., min_length=3, max_length=2048, description="Target URL to inspect")
    user_label: Optional[str] = None

class TextAnalysisRequest(BaseModel):
    text: str = Field(..., min_length=2, max_length=50000, description="Pasted message or email body")
    user_label: Optional[str] = None
    context_type: Optional[str] = Field("message", description="email, sms, chat, invoice, social")

class Finding(BaseModel):
    id: str
    title: str
    description: str
    severity: str  # low, medium, high, critical
    category: str
    confidence: float = 0.85

class EvidenceItem(BaseModel):
    signal_name: str
    observation: str
    raw_value: Optional[str] = None
    impact: str  # positive, neutral, negative

class Recommendation(BaseModel):
    action: str
    priority: str  # urgent, high, recommended, informational
    detail: str

class AnalysisResponse(BaseModel):
    id: str
    submission_type: str
    target_summary: str
    risk_score: int
    risk_category: str
    confidence_score: float
    status: str
    findings: List[Finding]
    evidence: List[EvidenceItem]
    limitations: List[str]
    recommendations: List[Recommendation]
    model_info: Dict[str, Any]
    created_at: datetime

    class Config:
        from_attributes = True

class ReportDetailResponse(AnalysisResponse):
    raw_input_preview: Optional[str] = None
    user_id: str
