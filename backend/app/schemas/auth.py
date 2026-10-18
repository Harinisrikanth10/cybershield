from datetime import datetime
from typing import Optional
from pydantic import BaseModel, EmailStr, Field

class UserRegister(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=8, description="Password must be at least 8 characters")
    full_name: Optional[str] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserOut(BaseModel):
    id: str
    email: str
    full_name: Optional[str] = None
    is_admin: bool = False
    role: str = "user"
    theme: str = "dark"
    notify_email: bool = True
    notify_high_risk: bool = True
    created_at: datetime

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_in: int
    user: UserOut

class PasswordResetRequest(BaseModel):
    email: EmailStr

class PasswordChangeRequest(BaseModel):
    current_password: str
    new_password: str = Field(..., min_length=8)
