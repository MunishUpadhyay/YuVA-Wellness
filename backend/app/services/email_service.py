"""
Email Service for sending OTPs via SMTP
"""
import smtplib
from email.message import EmailMessage
import logging
from app.core.config import get_settings

logger = logging.getLogger(__name__)
settings = get_settings()

class EmailService:
    @staticmethod
    def send_otp_email(to_email: str, otp: str) -> bool:
        """
        Send OTP email using SMTP.
        Returns True if successful, False otherwise.
        """
        if not settings.smtp_user or not settings.smtp_password:
            logger.warning("SMTP credentials not set. Skipping email send.")
            return False

        msg = EmailMessage()
        msg["Subject"] = "Your Verification Code"
        msg["From"] = settings.smtp_user
        msg["To"] = to_email
        msg.set_content(f"Your OTP code is: {otp}")

        try:
            with smtplib.SMTP(settings.smtp_host, settings.smtp_port) as server:
                server.starttls()
                server.login(settings.smtp_user, settings.smtp_password)
                server.send_message(msg)
            
            logger.info(f"OTP email sent successfully to {to_email}")
            return True
        except Exception as e:
            logger.error(f"Failed to send email to {to_email}: {str(e)}")
            return False
