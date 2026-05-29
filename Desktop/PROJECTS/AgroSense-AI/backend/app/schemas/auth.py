"""
AgroSense AI — Authentication Pydantic Schemas
================================================
Request/response models for register, login, and token endpoints.
"""

import uuid
from datetime import datetime
from typing import Optional

from pydantic import BaseModel, EmailStr, Field, field_validator


# ─────────────────────────────────────────────────────────────────────────────
# Request Schemas
# ─────────────────────────────────────────────────────────────────────────────
class UserRegisterRequest(BaseModel):
    """User registration payload."""
    email: EmailStr = Field(..., description="Valid email address")
    password: str = Field(
        ..., min_length=8, max_length=100, description="Password (min 8 characters)"
    )
    full_name: str = Field(..., min_length=2, max_length=200)
    phone_number: Optional[str] = Field(
        None, pattern=r"^\+91[6-9]\d{9}$", description="Indian mobile number (+91XXXXXXXXXX)"
    )
    preferred_district: Optional[str] = None
    role: str = Field(default="farmer")

    @field_validator("role")
    @classmethod
    def validate_role(cls, v: str) -> str:
        allowed = {"farmer", "agribusiness", "insurance", "government"}
        if v not in allowed:
            raise ValueError(f"Role must be one of: {allowed}")
        return v


class UserLoginRequest(BaseModel):
    """OAuth2-compatible login payload."""
    username: EmailStr = Field(..., description="User email")
    password: str = Field(..., min_length=1)


class PasswordChangeRequest(BaseModel):
    current_password: str
    new_password: str = Field(..., min_length=8)


class TokenRefreshRequest(BaseModel):
    refresh_token: str


# ─────────────────────────────────────────────────────────────────────────────
# Response Schemas
# ─────────────────────────────────────────────────────────────────────────────
class TokenResponse(BaseModel):
    """JWT token pair response."""
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int = Field(..., description="Access token lifetime in seconds")


class UserResponse(BaseModel):
    """Public user profile response."""
    id: uuid.UUID
    email: EmailStr
    full_name: str
    phone_number: Optional[str] = None
    role: str
    subscription_tier: str
    subscription_active: bool
    preferred_district: Optional[str] = None
    sms_alerts_enabled: bool
    push_alerts_enabled: bool
    is_active: bool
    is_verified: bool
    created_at: datetime

    model_config = {"from_attributes": True}


class UserUpdateRequest(BaseModel):
    """Partial user update payload."""
    full_name: Optional[str] = None
    phone_number: Optional[str] = None
    preferred_district: Optional[str] = None
    sms_alerts_enabled: Optional[bool] = None
    push_alerts_enabled: Optional[bool] = None
    firebase_token: Optional[str] = None
