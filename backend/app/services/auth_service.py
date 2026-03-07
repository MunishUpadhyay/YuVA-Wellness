"""
Authentication business logic for YuVA Wellness
"""
import uuid
from typing import Optional, Tuple
from datetime import datetime
import secrets

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, or_
from sqlalchemy.exc import IntegrityError

from app.db.models.user import User
from ..core.security import (
    hash_password, verify_password, is_password_strong,
    generate_recovery_code, hash_recovery_code
)
from ..core.config import get_settings

from google.oauth2 import id_token
from google.auth.transport import requests as google_requests

import logging
logger = logging.getLogger(__name__)
settings = get_settings()

class AuthService:
    """Authentication service supporting Local and Google providers"""
    
    @staticmethod
    async def create_guest_user(db: AsyncSession) -> User:
        """Create a new guest user"""
        guest_user = User(
            client_id=uuid.uuid4(),
            is_guest=True,
            provider="local"
        )
        db.add(guest_user)
        await db.commit()
        await db.refresh(guest_user)
        return guest_user
    
    @staticmethod
    async def get_user_by_client_id(db: AsyncSession, client_id: uuid.UUID) -> Optional[User]:
        """Get user by client_id"""
        result = await db.execute(select(User).where(User.client_id == client_id))
        return result.scalar_one_or_none()
    
    @staticmethod
    async def get_user_by_identifier(db: AsyncSession, identifier: str) -> Optional[User]:
        """Get user by email or phone"""
        result = await db.execute(
            select(User).where(
                or_(User.email == identifier, User.phone == identifier)
            )
        )
        return result.scalar_one_or_none()

    @staticmethod
    async def verify_password_login(db: AsyncSession, identifier: str, password: str) -> Optional[User]:
        """
        Verify identifier and password (Standard 1FA).
        """
        user = await AuthService.get_user_by_identifier(db, identifier)
        if not user or user.is_guest:
            return None
        
        # Google users might not have a password
        if not user.password_hash:
            logger.info(f"Login attempt failed: User {identifier} has no password (likely Google provider)")
            return None
            
        if verify_password(password, user.password_hash):
            return user
        return None

    @staticmethod
    async def verify_google_token(token: str) -> Optional[dict]:
        """
        Verify Google ID token.
        Returns user info dict if valid, None otherwise.
        """
        try:
            # Specify the CLIENT_ID of the app that accesses the backend:
            idinfo = id_token.verify_oauth2_token(
                token, 
                google_requests.Request(), 
                settings.google_client_id
            )

            # ID token is valid. Get the user's Google Account ID from the decoded token.
            # userid = idinfo['sub']
            return idinfo
        except ValueError as e:
            # Invalid token
            logger.error(f"Google Token Verification Failed: {str(e)}")
            return None

    @staticmethod
    async def authenticate_google_user(db: AsyncSession, idinfo: dict) -> User:
        """
        Handle user retrieval/creation for Google login.
        """
        email = idinfo.get('email')
        first_name = idinfo.get('given_name', 'YuVA')
        last_name = idinfo.get('family_name', 'User')
        profile_picture = idinfo.get('picture')

        # 1. Check if user exists
        user = await AuthService.get_user_by_identifier(db, email)
        
        if user:
            # Update info if provider matches or if migrating local to google
            user.first_name = user.first_name or first_name
            user.last_name = user.last_name or last_name
            user.profile_picture = profile_picture
            user.provider = "google" # Mark as google user
            await db.commit()
            await db.refresh(user)
            return user
        
        # 2. Create new user
        new_user = User(
            client_id=uuid.uuid4(),
            email=email,
            first_name=first_name,
            last_name=last_name,
            profile_picture=profile_picture,
            provider="google",
            is_guest=False,
            is_active=True
        )
        db.add(new_user)
        try:
            await db.commit()
            await db.refresh(new_user)
            return new_user
        except IntegrityError:
            await db.rollback()
            # Race condition: user created between check and commit
            result = await db.execute(select(User).where(User.email == email))
            return result.scalar_one()

    @staticmethod
    async def register_user(
        db: AsyncSession, 
        email: str, 
        password: str, 
        first_name: str, 
        last_name: Optional[str] = None
    ) -> Tuple[Optional[User], str, str]:
        """
        Register a new user (Standard 1FA). Returns (user, error, recovery_code).
        """
        # Validate password
        is_valid, error_msg = is_password_strong(password)
        if not is_valid:
            return None, error_msg, ""
            
        # Check existence
        u = await AuthService.get_user_by_identifier(db, email)
        if u: 
            return None, "Email already registered", ""
            
        password_hash = hash_password(password)
        recovery_code = generate_recovery_code()
        recovery_code_hash = hash_recovery_code(recovery_code)
        
        try:
            new_user = User(
                client_id=uuid.uuid4(),
                email=email,
                password_hash=password_hash,
                recovery_code_hash=recovery_code_hash,
                first_name=first_name,
                last_name=last_name,
                is_guest=False,
                is_active=True,
                provider="local"
            )
            db.add(new_user)
            await db.commit()
            await db.refresh(new_user)
            return new_user, "", recovery_code
        except IntegrityError:
            await db.rollback()
            return None, "User already registered", ""

    @staticmethod
    async def validate_and_change_password(
        db: AsyncSession, 
        user_id: uuid.UUID, 
        current_password: Optional[str], 
        new_password: str,
        recovery_code: Optional[str] = None
    ) -> Tuple[bool, str]:
        """
        Verify current password OR recovery code and update to a new one.
        """
        # Fetch user
        result = await db.execute(select(User).where(User.id == user_id))
        user = result.scalar_one_or_none()
        
        if not user or user.is_guest:
            return False, "User not found"

        verified = False
        
        # 1. Try recovery code first if provided
        if recovery_code and user.recovery_code_hash:
            if hash_recovery_code(recovery_code) == user.recovery_code_hash:
                verified = True
            else:
                return False, "Invalid recovery code"

        # 2. Then try current password if not already verified
        if not verified and user.password_hash:
            if not current_password:
                return False, "Current password or recovery code is required"
            if not verify_password(current_password, user.password_hash):
                return False, "Incorrect current password"
            verified = True
        
        # 3. Handle edge case: Google user with no password hash and no recovery code provided
        if not verified and not user.password_hash:
            # If Google user, we allow setting password for the first time without current password
            verified = True

        if not verified:
            return False, "Verification failed"
        
        # Validate and update
        is_valid, error_msg = is_password_strong(new_password)
        if not is_valid:
            return False, error_msg

        user.password_hash = hash_password(new_password)
        user.provider = "local" # Ensure they can always login with local password now
        await db.commit()
        return True, "Password updated successfully"

    @staticmethod
    async def reset_password_with_recovery(
        db: AsyncSession,
        email: str,
        recovery_code: str,
        new_password: str
    ) -> Tuple[bool, str]:
        """Reset password using email and recovery code"""
        user = await AuthService.get_user_by_identifier(db, email)
        if not user or user.is_guest:
            return False, "User not found"
        
        if not user.recovery_code_hash or hash_recovery_code(recovery_code) != user.recovery_code_hash:
            return False, "Invalid recovery code"
        
        # Validate and update
        is_valid, error_msg = is_password_strong(new_password)
        if not is_valid:
            return False, error_msg
        
        user.password_hash = hash_password(new_password)
        user.provider = "local"
        await db.commit()
        return True, "Password reset successfully"

    @staticmethod
    async def generate_legacy_recovery_code(db: AsyncSession, user_id: uuid.UUID) -> Tuple[bool, str, str]:
        """
        Generate a recovery code for an existing user who doesn't have one.
        Can only be done ONCE in a lifetime.
        """
        result = await db.execute(select(User).where(User.id == user_id))
        user = result.scalar_one_or_none()
        
        if not user:
            return False, "User not found", ""
            
        if user.recovery_code_hash:
            return False, "Recovery code already exists and can only be set once.", ""
            
        recovery_code = generate_recovery_code()
        user.recovery_code_hash = hash_recovery_code(recovery_code)
        
        await db.commit()
        return True, "Recovery code generated successfully. Please save it safely.", recovery_code
