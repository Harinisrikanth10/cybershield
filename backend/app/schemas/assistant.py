from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, Field

class ChatMessageCreate(BaseModel):
    content: str = Field(..., min_length=1, max_length=10000)
    session_id: Optional[str] = None
    attached_report_id: Optional[str] = None

class ChatMessageOut(BaseModel):
    id: str
    role: str
    content: str
    attached_report_id: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

class ChatSessionOut(BaseModel):
    id: str
    title: str
    created_at: datetime
    messages: List[ChatMessageOut] = []

    class Config:
        from_attributes = True
