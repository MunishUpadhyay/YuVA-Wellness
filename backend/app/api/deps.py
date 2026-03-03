"""
Authentication dependencies for FastAPI
"""
import uuid
from typing import Optional
from fastapi import Depends, Request, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from ..db.session import get_db
from app.services.auth_service import AuthService
from app.db.models.user import User
from app.core.security import decode_token, verify_token_scope

# Define OAuth2 scheme for Swagger UI
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login", auto_error=False)

async def get_user_from_token(
    token: str, 
    db: AsyncSession
) -> Optional[User]:
    """Helper to get user from JWT token"""
    try:
        payload = decode_token(token)
        verify_token_scope(payload, "access")
        user_id_str = payload.get("sub")
        if user_id_str:
            result = await db.execute(
                select(User).where(User.id == uuid.UUID(user_id_str))
            )
            return result.scalar_one_or_none()
    except Exception:
        return None
    return None

async def get_current_user_optional(
    request: Request,
    token: Optional[str] = Depends(oauth2_scheme),
    db: AsyncSession = Depends(get_db)
) -> Optional[User]:
    """
    Get current user from Bearer Token OR Cookie
    Returns None if not found (doesn't auto-create guest)
    """
    # 1. Check Bearer Token
    if token:
        user = await get_user_from_token(token, db)
        if user:
            return user
            
    # 2. Check Cookie
    client_id_str = request.cookies.get("client_id")
    if client_id_str:
        try:
            client_id = uuid.UUID(client_id_str)
            user = await AuthService.get_user_by_client_id(db, client_id)
            if user:
                return user
        except (ValueError, TypeError):
            pass
            
    return None

async def get_current_user(
    request: Request,
    token: Optional[str] = Depends(oauth2_scheme),
    db: AsyncSession = Depends(get_db)
) -> User:
    """
    Get current user (Token -> Cookie -> Create Guest)
    """
    # 1. Check Bearer Token
    if token:
        user = await get_user_from_token(token, db)
        if user:
            return user
            
    # 2. Check Cookie
    client_id_str = request.cookies.get("client_id")
    if client_id_str:
        try:
            client_id = uuid.UUID(client_id_str)
            user = await AuthService.get_user_by_client_id(db, client_id)
            if user:
                return user
        except (ValueError, TypeError):
            pass
    
    # 3. Create Guest
    guest_user = await AuthService.create_guest_user(db)
    return guest_user

async def get_authenticated_user(
    current_user: User = Depends(get_current_user)
) -> User:
    """
    Get authenticated (registered) user only.
    Raises 401 if guest.
    """
    if current_user.is_guest:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required"
        )
    return current_user

def get_client_id_from_request(request: Request) -> Optional[uuid.UUID]:
    """Extract client_id from cookie"""
    client_id_str = request.cookies.get("client_id")
    if client_id_str:
        try:
            return uuid.UUID(client_id_str)
        except (ValueError, TypeError):
            pass
    return None