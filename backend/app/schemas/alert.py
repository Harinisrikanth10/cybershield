from datetime import datetime
from typing import Optional
from pydantic import BaseModel

class AlertOut(BaseModel):
    id: str
    title: str
    message: str
    severity: str
    is_read: bool
    analysis_id: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

class AlertUpdate(BaseModel):
    is_read: bool
