"""
Authentication business logic for YuVA Wellness
"""
import uuid
from typing import Optional, Tuple
from datetime import datetime, timedelta
import secrets

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, or_, desc, delete
from sqlalchemy.exc import IntegrityError

from app.db.models.user import User
from app.db.models.otp import OTP
from ..core.security import hash_password, verify_password, is_password_strong, hash_otp

class AuthService:
    """Authentication service with 2FA logic"""
    
    @staticmethod
    async def create_guest_user(db: AsyncSession) -> User:
        """Create a new guest user"""
        guest_user = User(
            client_id=uuid.uuid4(),
            is_guest=True
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
        Stage 1: Verify identifier and password.
        Returns User if valid, None otherwise.
        """
        user = await AuthService.get_user_by_identifier(db, identifier)
        if not user or user.is_guest:
            return None
        
        if not user.password_hash:
            return None
            
        if verify_password(password, user.password_hash):
            return user
        return None

    @staticmethod
    async def generate_otp(db: AsyncSession, user_id: uuid.UUID, email: str) -> str:
        """
        Generate, hash, and store OTP for user.
        Sends email via SMTP.
        Returns the PLAIN code (to be sent via email/SMS).
        """
        from .email_service import EmailService
        from fastapi import HTTPException
        
        # Generate 6-digit code
        code = "".join([str(secrets.randbelow(10)) for _ in range(6)])
        code_hash = hash_otp(code)
        expires_at = datetime.utcnow() + timedelta(minutes=5)
        
        # Try sending email BEFORE committing to DB (or after? Requirements say "OTP is not stored if email sending fails")
        # So we should send first? Or send then commit? 
        # "Ensure OTP is not stored if email sending fails" -> Send first or rollback.
        
        sent = EmailService.send_otp_email(email, code)
        if not sent:
             raise HTTPException(status_code=500, detail="Failed to send OTP email")

        # Invalidate previous OTPs
        await db.execute(delete(OTP).where(OTP.user_id == user_id))
        
        otp_entry = OTP(
            user_id=user_id,
            otp_hash=code_hash,
            expires_at=expires_at,
            attempts=0,
            is_used=False
        )
        
        db.add(otp_entry)
        await db.commit()
        
        return code

    @staticmethod
    async def verify_otp(db: AsyncSession, user_id: uuid.UUID, code: str) -> bool:
        """
        Stage 2: Verify OTP code.
        Checks hash, expiry, and max attempts.
        """
        # Find latest valid OTP
        result = await db.execute(
            select(OTP).where(
                OTP.user_id == user_id,
                OTP.is_used == False,
                OTP.expires_at > datetime.utcnow()
            ).order_by(desc(OTP.created_at))
        )
        otp_entry = result.scalars().first()
        
        if not otp_entry:
            return False
            
        # Check attempts
        if otp_entry.attempts >= 5:
            # Invalidate
            otp_entry.is_used = True
            await db.commit()
            return False
            
        # Check hash
        if otp_entry.otp_hash == hash_otp(code):
            otp_entry.is_used = True
            await db.commit()
            return True
        else:
            # Increment attempts
            otp_entry.attempts += 1
            await db.commit()
            return False

    @staticmethod
    async def register_user(
        db: AsyncSession, 
        email: Optional[str],
        phone: Optional[str],
        password: str,
        first_name: str,
        last_name: Optional[str] = None,
        otp: Optional[str] = None
    ) -> Tuple[Optional[User], str]:
        """
        Register a new user.
        """
        # Validate password
        is_valid, error_msg = is_password_strong(password)
        if not is_valid:
            return None, error_msg
            
        # Check existence
        if email:
            u = await AuthService.get_user_by_identifier(db, email)
            if u: return None, "Email already registered"
        if phone:
            u = await AuthService.get_user_by_identifier(db, phone)
            if u: return None, "Phone already registered"
            
        password_hash = hash_password(password)
        
        try:
            new_user = User(
                client_id=uuid.uuid4(),
                email=email,
                phone=phone,
                password_hash=password_hash,
                first_name=first_name,
                last_name=last_name,
                is_guest=False,
                is_active=True
            )
            db.add(new_user)
            await db.commit()
            await db.refresh(new_user)
            return new_user, ""
        except IntegrityError:
            await db.rollback()
            return None, "User already registered"
