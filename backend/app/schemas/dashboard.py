from datetime import datetime
from typing import List, Dict, Any, Optional
from pydantic import BaseModel

class RecentActivityItem(BaseModel):
    id: str
    submission_type: str
    target_summary: str
    risk_score: int
    risk_category: str
    status: str
    created_at: datetime

class RiskDistribution(BaseModel):
    low: int
    medium: int
    high: int
    critical: int

class CategoryDistribution(BaseModel):
    url: int
    text: int
    image: int
    audio: int
    video: int

class SecurityTip(BaseModel):
    id: str
    title: str
    category: str
    tip: str
    severity: str

class DashboardSummaryResponse(BaseModel):
    total_analyses: int
    high_risk_items: int
    medium_risk_items: int
    low_risk_items: int
    critical_risk_items: int
    unread_alerts_count: int
    risk_distribution: RiskDistribution
    category_distribution: CategoryDistribution
    recent_activity: List[RecentActivityItem]
    security_tips: List[SecurityTip]
