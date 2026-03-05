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
        Send professional HTML OTP email using SMTP.
        Returns True if successful, False otherwise.
        """
        if not settings.smtp_user or not settings.smtp_password:
            logger.warning("SMTP credentials not set. Skipping email send.")
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
                    <hr style="border: 0; border-top: 1px solid #f1f5f9; margin: 32px 0;" />
                    <p style="font-size: 12px; color: #cbd5e1; text-align: center;">&copy; 2026 YuVA Wellness. Empowering Indian Youth.</p>
                </div>
            </body>
        </html>
        """

        msg = EmailMessage()
        msg["Subject"] = f"{otp} is your YuVA verification code"
        msg["From"] = f"{settings.mail_from_name} <{settings.smtp_user}>"
        msg["To"] = to_email
        msg.set_content(f"Your OTP code is: {otp}") # Fallback plain text
        msg.add_alternative(html_content, subtype="html")

        try:
            # Use standard SMTP with STARTTLS
            server = smtplib.SMTP(settings.smtp_host, settings.smtp_port, timeout=10)
            server.ehlo()
            server.starttls()
            server.ehlo()
            server.login(settings.smtp_user, settings.smtp_password)
            server.send_message(msg)
            server.quit()
            
            logger.info(f"HTML OTP email sent successfully to {to_email}")
            return True
        except Exception as e:
            logger.error(f"Failed to send HTML email to {to_email}: {str(e)}")
            return False
