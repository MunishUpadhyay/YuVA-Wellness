"""
Email Service for sending OTPs via Brevo SMTP
"""
import smtplib
from email.message import EmailMessage
import logging
from app.core.config import get_settings

logger = logging.getLogger(__name__)
settings = get_settings()

# Global to track the last error for the /api/status check
last_email_error = None

class EmailService:
    @staticmethod
    def send_otp_email(to_email: str, otp: str) -> bool:
        """
        Send professional HTML OTP email using Brevo SMTP.
        Returns True if successful, False otherwise.
        """
        global last_email_error
        
        if not settings.smtp_user or not settings.smtp_password:
            last_email_error = "SMTP credentials missing in configuration"
            logger.warning(last_email_error)
            return False

        # Create HTML content
        html_content = f"""
        <html>
            <body style="font-family: 'Inter', sans-serif; background-color: #f8fafc; padding: 40px; color: #1e293b;">
                <div style="max-width: 500px; margin: 0 auto; background: #ffffff; border-radius: 12px; padding: 32px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
                    <h2 style="color: #6366f1; margin-bottom: 24px; text-align: center;">YuVA Wellness</h2>
                    <p style="font-size: 16px; line-height: 24px; color: #475569;">Hello,</p>
                    <p style="font-size: 16px; line-height: 24px; color: #475569;">Your verification code is below. Please enter this code to securely access your account.</p>
                    <div style="margin: 32px 0; text-align: center;">
                        <div style="display: inline-block; background: #f1f5f9; padding: 16px 32px; border-radius: 8px; font-size: 32px; font-weight: 700; letter-spacing: 4px; color: #1e293b; border: 1px solid #e2e8f0;">
                            {otp}
                        </div>
                    </div>
                    <p style="font-size: 14px; line-height: 20px; color: #94a3b8; text-align: center;">This code will expire in 5 minutes. If you did not request this, please ignore this email.</p>
                    <p style="font-size: 12px; color: #cbd5e1; text-align: center;">&copy; 2026 YuVA Wellness. Empowering Indian Youth.</p>
                </div>
            </body>
        </html>
        """

        msg = EmailMessage()
        msg["Subject"] = f"{otp} is your YuVA verification code"
        msg["From"] = settings.smtp_user
        msg["To"] = to_email
        msg.set_content(f"Your OTP code is: {otp}") # Fallback plain text
        msg.add_alternative(html_content, subtype="html")

        try:
            logger.info(f"Attempting to send OTP email via Brevo SMTP to {to_email}")
            with smtplib.SMTP(settings.smtp_host, settings.smtp_port, timeout=15) as server:
                server.starttls()
                server.login(settings.smtp_user, settings.smtp_password)
                server.send_message(msg)
                last_email_error = None
                logger.info(f"OTP sent successfully via Brevo SMTP to {to_email}")
                return True
        except Exception as e:
            last_email_error = f"Brevo SMTP Failure: {str(e)}"
            logger.error(f"Critical Email Failure for {to_email}: {last_email_error}")
            return False
