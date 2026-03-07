"""
Authentication routes for YuVA Wellness
"""
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status, Response, Request
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.ext.asyncio import AsyncSession

from ..db.session import get_db
from app.core.config import get_settings
from app.schemas.auth import (
    RegisterRequest, LoginRequest, AuthResponse, 
    GuestResponse, LogoutResponse, UserResponse,
    GoogleLoginRequest, PasswordChangeRequest
)
from app.services.auth_service import AuthService
from app.core.security import create_access_token
from .deps import get_current_user, get_client_id_from_request
import logging
import uuid

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/auth", tags=["Authentication"])
settings = get_settings()

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")

@router.post("/login", response_model=AuthResponse)
async def login(
    credentials: LoginRequest,
    response: Response,
    db: AsyncSession = Depends(get_db)
):
    """
    Standard Login: Authenticate with password and issue token immediately.
    """
    # 1. Verify credentials
    user = await AuthService.verify_password_login(
        db, credentials.identifier, credentials.password
    )
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid identifier or password"
        )
        
    if not user.is_active:
         raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Account is inactive"
        )

    # 2. Issue Access Token Immediately (1FA)
    access_token = create_access_token(
        data={
            "sub": str(user.id),
            "first_name": user.first_name,
            "email": user.email
        }
    )
    
    return AuthResponse(
        user=UserResponse.model_validate(user),
        message="Login successful",
        access_token=access_token,
        requires_otp=False
    )

@router.post("/google", response_model=AuthResponse)
async def google_login(
    request: GoogleLoginRequest,
    db: AsyncSession = Depends(get_db)
):
    """
    Google OAuth Login: Verify token and issue session.
    """
    # 1. Verify Google ID Token
    idinfo = await AuthService.verify_google_token(request.credential)
    if not idinfo:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid Google credential"
        )
    
    # 2. Authenticate/Create User
    user = await AuthService.authenticate_google_user(db, idinfo)
    
    # 3. Issue Access Token
    access_token = create_access_token(
        data={
            "sub": str(user.id),
            "first_name": user.first_name,
            "email": user.email
        }
    )
    
    return AuthResponse(
        user=UserResponse.model_validate(user),
        message="Google login successful",
        access_token=access_token,
        requires_otp=False
    )

@router.post("/register", response_model=AuthResponse)
async def register(
    user_data: RegisterRequest,
    response: Response,
    db: AsyncSession = Depends(get_db)
):
    """
    Standard Registration: Create account instantly. 
    """
    # 1. Register user
    user, error_msg = await AuthService.register_user(
        db, user_data.email, user_data.password,
        user_data.first_name, user_data.last_name
    )
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=error_msg
        )
        
    # 2. Issue Token (Optional, but user said "return the authenticated user session")
    access_token = create_access_token(
        data={
            "sub": str(user.id),
            "first_name": user.first_name,
            "email": user.email
        }
    )
        
    return AuthResponse(
        user=UserResponse.model_validate(user),
        message="Registration successful.",
        access_token=access_token
    )

@router.post("/guest", response_model=GuestResponse)
async def create_guest(
    response: Response,
    request: Request,
    db: AsyncSession = Depends(get_db)
):
    """Create guest user session"""
    existing_client_id = get_client_id_from_request(request)
    if existing_client_id:
        existing_user = await AuthService.get_user_by_client_id(db, existing_client_id)
        if existing_user:
            return GuestResponse(
                user=UserResponse.model_validate(existing_user),
                message="Existing session found"
            )
    
    guest_user = await AuthService.create_guest_user(db)
    
    # Set httpOnly cookie for guest
    response.set_cookie(
        key="client_id",
        value=str(guest_user.client_id),
        httponly=True,
        secure=settings.is_production,
        samesite="lax",
        max_age=30 * 24 * 60 * 60 
    )
    
    return GuestResponse(
        user=UserResponse.model_validate(guest_user),
        message="Guest user created"
    )

@router.post("/logout", response_model=LogoutResponse)
async def logout(response: Response):
    """Logout"""
    response.delete_cookie(key="client_id")
    return LogoutResponse(message="Logged out successfully")

@router.post("/change-password")
async def change_password(
    request: PasswordChangeRequest,
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Change password for authenticated user.
    """
    success, message = await AuthService.validate_and_change_password(
        db, current_user.id, request.current_password, request.new_password
    )
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=message
        )
        
    return {"message": message}

@router.get("/me", response_model=UserResponse)
async def get_current_user_info(
    current_user: UserResponse = Depends(get_current_user)
):
    """Get current user info"""
    return UserResponse.model_validate(current_user)

@router.get("/check", response_model=Optional[UserResponse])
async def check_existing_session(
    request: Request,
    db: AsyncSession = Depends(get_db)
):
    """Check session"""
    # Extract token
    auth_header = request.headers.get("Authorization")
    if auth_header and auth_header.startswith("Bearer "):
        from app.core.security import decode_token, verify_token_scope
        token = auth_header.split(" ")[1]
        try:
            payload = decode_token(token)
            verify_token_scope(payload, "access")
            user_id = payload.get("sub")
            if user_id:
                # Fetch user
                from app.db.models.user import User
                from sqlalchemy import select
                result = await db.execute(select(User).where(User.id == uuid.UUID(user_id)))
                user = result.scalar_one_or_none()
                if user:
                    return UserResponse.model_validate(user)
        except Exception:
            pass
            
    # Fallback to cookie
    client_id = get_client_id_from_request(request)
    if client_id:
        user = await AuthService.get_user_by_client_id(db, client_id)
        if user:
            return UserResponse.model_validate(user)
            
    return None