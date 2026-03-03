"""
Authentication Pydantic schemas for YuVA Wellness
"""
import uuid
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, EmailStr, Field, validator

# Request schemas

class OTPGenerateRequest(BaseModel):
    """Request to generate OTP"""
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    
    @validator('email', always=True)
    def check_identifier(cls, v, values):
        if not v and not values.get('phone'):
            raise ValueError('Either email or phone is required')
        return v

class RegisterRequest(BaseModel):
    """User registration request"""
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    password: str = Field(..., min_length=8, max_length=128)
    first_name: str = Field(..., min_length=1, max_length=100)
    last_name: Optional[str] = None
    
    @validator('email', always=True)
    def check_identifier(cls, v, values):
        if not v and not values.get('phone'):
            raise ValueError('Either email or phone is required')
        return v

class LoginRequest(BaseModel):
    """Stage 1 Login: Identifier + Password"""
    identifier: str # email or phone
    password: str

class OTPVerifyRequest(BaseModel):
    """Stage 2 Login: Temp Token + OTP"""
    temp_token: str
    otp: str

class ResendOTPRequest(BaseModel):
    """Resend OTP using temp token"""
    temp_token: str

# Response schemas

class UserResponse(BaseModel):
    """User information response (safe for frontend)"""
    id: uuid.UUID
    client_id: uuid.UUID
    email: Optional[str] = None
    phone: Optional[str] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    is_guest: bool
    is_active: bool
    created_at: datetime
    updated_at: datetime       

    class Config:
        from_attributes = True


class AuthResponse(BaseModel):
    """Authentication response"""
    user: Optional[UserResponse] = None
    message: str
    
    # 2FA fields
    requires_otp: bool = False
    temp_token: Optional[str] = None
    access_token: Optional[str] = None
    refresh_token: Optional[str] = None


class GuestResponse(BaseModel):
    """Guest user creation response"""
    user: UserResponse
    message: str = "Guest user created"


class LogoutResponse(BaseModel):
    """Logout response"""
    message: str = "Logged out successfully"
