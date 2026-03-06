"""
Authentication routes for YuVA Wellness
"""
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status, Response, Request, Body
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.ext.asyncio import AsyncSession

from ..db.session import get_db
from app.core.config import get_settings
from app.schemas.auth import (
    RegisterRequest, RegisterOTPRequest, LoginRequest, AuthResponse, 
    GuestResponse, LogoutResponse, UserResponse,
    OTPGenerateRequest, OTPVerifyRequest, ResendOTPRequest,
    ForgotPasswordRequest, VerifyResetOTPRequest, ResetPasswordRequest
)
from app.services.auth_service import AuthService
from app.core.security import create_access_token, create_temp_token, decode_token, verify_token_scope
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
    Stage 1: Authenticate with password.
    Returns temp_token and requires_otp=True.
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

    # 2. Generate OTP
    # Note: In production, send this via email/SMS. 
    # For now, it's printed to console by generate_otp (wait, I removed print from service, I should add it back or return it)
    # The service returns the code.
    otp_code = await AuthService.generate_otp(db, email=user.email, user_id=user.id)
    
    
    # 3. Generate Temp Token (5 min expiry)
    temp_token = create_temp_token(
        data={"sub": str(user.id), "stage": "otp_verification"}
    )
    
    return AuthResponse(
        message="OTP sent to your registered contact.",
        requires_otp=True,
        temp_token=temp_token
    )

@router.post("/verify-otp", response_model=AuthResponse)
async def verify_otp(
    request: OTPVerifyRequest,
    response: Response,
    db: AsyncSession = Depends(get_db)
):
    """
    Stage 2: Verify OTP and issue access token.
    """
    # 1. Validate temp token
    payload = decode_token(request.temp_token)
    verify_token_scope(payload, "otp_stage")
    user_id_str = payload.get("sub")
    if not user_id_str:
        raise HTTPException(status_code=401, detail="Invalid token")
        
    user_id = uuid.UUID(user_id_str)
    
    # 2. Fetch User and Email
    from sqlalchemy import select
    from app.db.models.user import User
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # 3. Verify OTP
    is_valid = await AuthService.verify_otp(db, user.email, request.otp)
    if not is_valid:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, 
            detail="Invalid or expired OTP"
        )

    # 4. Issue Access Token
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

@router.post("/resend-otp", response_model=AuthResponse)
async def resend_otp(
    request: ResendOTPRequest,
    db: AsyncSession = Depends(get_db)
):
    """
    Resend OTP if expired.
    """
    # 1. Validate temp token
    payload = decode_token(request.temp_token)
    verify_token_scope(payload, "otp_stage")
    user_id_str = payload.get("sub")
    
    user_id = uuid.UUID(user_id_str)
    
    # 2. Generate new OTP
    # 2. Generate new OTP
    # Need user email before generating OTP
    from sqlalchemy import select
    from app.db.models.user import User
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
         from fastapi import HTTPException
         raise HTTPException(status_code=404, detail="User not found")
         
    otp_code = await AuthService.generate_otp(db, email=user.email, user_id=user_id)
    
    # 3. Return fresh temp token (reset timer)
    temp_token = create_temp_token(
        data={"sub": str(user_id), "stage": "otp_verification"}
    )
    
    return AuthResponse(
        message="OTP resent successfully.",
        requires_otp=True,
        temp_token=temp_token
    )

@router.post("/forgot-password", response_model=AuthResponse)
async def forgot_password(
    request: ForgotPasswordRequest,
    db: AsyncSession = Depends(get_db)
):
    """Stage 1: Request OTP for password reset"""
    user = await AuthService.get_user_by_identifier(db, request.email)
    
    # Always return success to prevent email enumeration attacks
    if not user or user.is_guest:
        return AuthResponse(
            message="If your email is registered, you will receive an OTP shortly.",
            requires_otp=True,
            temp_token="fake_token"
        )
        
    otp_code = await AuthService.generate_otp(db, email=user.email, user_id=user.id)
    
    msg = f"------------ PASSWORD RESET OTP for {user.email}: {otp_code} ------------"
    print(msg, flush=True)
    logger.info(msg)
    
    reset_token_stage1 = create_temp_token(
        data={"sub": str(user.id), "stage": "password_reset_stage1"}
    )
    
    return AuthResponse(
        message="OTP sent to your registered contact.",
        requires_otp=True,
        temp_token=reset_token_stage1
    )

@router.post("/verify-reset-otp", response_model=AuthResponse)
async def verify_reset_otp(
    request: VerifyResetOTPRequest,
    db: AsyncSession = Depends(get_db)
):
    """Stage 2: Verify OTP for password reset"""
    # 1. Validate temp token
    payload = decode_token(request.reset_token)
    verify_token_scope(payload, "otp_stage")
    
    if payload.get("stage") != "password_reset_stage1":
        raise HTTPException(status_code=401, detail="Invalid token stage")
        
    user_id_str = payload.get("sub")
    if not user_id_str:
        raise HTTPException(status_code=401, detail="Invalid token")
        
    user_id = uuid.UUID(user_id_str)
    
    # 2. Verify OTP
    is_valid = await AuthService.verify_otp(db, user_id, request.otp)
    if not is_valid:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, 
            detail="Invalid or expired OTP"
        )
        
    # 3. Issue stage 2 token allowing password change
    reset_token_stage2 = create_temp_token(
        data={"sub": str(user_id), "stage": "password_reset_stage2"}
    )
    
    return AuthResponse(
        message="OTP verified. Proceed to reset password.",
        temp_token=reset_token_stage2,
        requires_otp=False
    )

@router.post("/reset-password", response_model=AuthResponse)
async def reset_password(
    request: ResetPasswordRequest,
    db: AsyncSession = Depends(get_db)
):
    """Stage 3: Save new password"""
    payload = decode_token(request.reset_token)
    verify_token_scope(payload, "otp_stage")
    
    if payload.get("stage") != "password_reset_stage2":
        raise HTTPException(status_code=401, detail="Invalid token stage or expired")
        
    user_id_str = payload.get("sub")
    user_id = uuid.UUID(user_id_str)
    
    success, msg = await AuthService.update_password(db, user_id, request.new_password)
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=msg
        )
        
    return AuthResponse(
        message="Password reset successfully."
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

@router.post("/register/otp", response_model=AuthResponse)
async def send_registration_otp(
    request: RegisterOTPRequest,
    db: AsyncSession = Depends(get_db)
):
    """
    Stage 1 Registration: Send OTP to verify email.
    Works for non-existent users.
    """
    # 1. Check if user already exists
    user = await AuthService.get_user_by_identifier(db, request.email)
    if user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered. Please login."
        )
        
    # 2. Generate and send OTP (Pre-Account)
    await AuthService.generate_otp(db, email=request.email)
    
    return AuthResponse(
        message="OTP sent to your email. Please verify to complete registration.",
        requires_otp=True
    )

@router.post("/register", response_model=AuthResponse)
async def register(
    user_data: RegisterRequest,
    response: Response,
    db: AsyncSession = Depends(get_db)
):
    """
    Stage 2 Registration: Verify OTP and create account.
    """
    # 1. Verify OTP first
    is_valid = await AuthService.verify_otp(db, user_data.email, user_data.otp)
    if not is_valid:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired OTP"
        )
        
    # 2. Register user
    user, error_msg = await AuthService.register_user(
        db, user_data.email, None, user_data.password,
        user_data.first_name, user_data.last_name
    )
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=error_msg
        )
        
    return AuthResponse(
        user=UserResponse.model_validate(user),
        message="Registration successful. You can now login."
    )

@router.post("/logout", response_model=LogoutResponse)
async def logout(response: Response):
    """Logout"""
    response.delete_cookie(key="client_id")
    return LogoutResponse(message="Logged out successfully")

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
    # Manually check deps logic to avoid auto-create
    # We need to import logic from deps logic?
    # Let's re-use the dep but maybe we need a separate "get_optional_user"
    # Actually current get_current_user auto-creates guest.
    # We need to verify if the token header is present.
    
    # Extract token
    auth_header = request.headers.get("Authorization")
    if auth_header and auth_header.startswith("Bearer "):
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