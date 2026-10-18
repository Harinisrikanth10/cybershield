from datetime import datetime
from typing import Optional, List, Any
from pydantic import BaseModel

class ProfileUpdate(BaseModel):
    full_name: Optional[str] = None
    theme: Optional[str] = None
    notify_email: Optional[bool] = None
    notify_high_risk: Optional[bool] = None

class ProfileExportData(BaseModel):
    export_timestamp: datetime
    user_info: dict
    total_analyses: int
    analyses: List[dict]
    alerts: List[dict]
    learning_progress: List[dict]
