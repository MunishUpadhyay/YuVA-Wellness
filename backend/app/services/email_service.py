"""
Email Service for sending OTPs via SMTP
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
        Send professional HTML OTP email using SMTP with resilience (Fallback 587 -> 465).
        Returns True if successful, False otherwise.
        """
        global last_email_error
        
        if not settings.smtp_user or not settings.smtp_password:
            last_email_error = "Credentials missing in config"
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
        msg["From"] = f"{settings.mail_from_name} <{settings.smtp_user}>"
        msg["To"] = to_email
        msg.set_content(f"Your OTP code is: {otp}") # Fallback plain text
        msg.add_alternative(html_content, subtype="html")

        resend_error = "Not attempted"
        # Try Resend API first if Key is present (Bypasses SMTP port blocks)
        if settings.resend_api_key:
            try:
                import json
                import urllib.request
                
                logger.info(f"Using Resend Web API for {to_email}")
                url = "https://api.resend.com/emails"
                headers = {
                    "Authorization": f"Bearer {settings.resend_api_key}",
                    "Content-Type": "application/json"
                }
                
                # Resend 403 check: If sender is Gmail/Yahoo, they won't allow it without verification.
                # Default to onboarding@resend.dev for testing/unverified domains.
                from_addr = settings.mail_from_address
                if "gmail.com" in from_addr or "yuva-wellness.com" in from_addr:
                    from_addr = "onboarding@resend.dev"
                
                data = {
                    "from": f"{settings.mail_from_name} <{from_addr}>",
                    "to": [to_email],
                    "subject": f"{otp} is your YuVA verification code",
                    "html": html_content,
                    "text": f"Your OTP code is: {otp}"
                }
                
                req = urllib.request.Request(url, data=json.dumps(data).encode("utf-8"), headers=headers, method="POST")
                with urllib.request.urlopen(req, timeout=10) as response:
                    if response.status in [200, 201, 202]:
                        last_email_error = None
                        logger.info(f"OTP sent successfully via Resend API to {to_email}")
                        return True
                    else:
                        raise Exception(f"Resend returned status {response.status}")
                        
            except Exception as eapi:
                resend_error = str(eapi)
                logger.warning(f"Resend API failed: {resend_error}. Falling back to SMTP...")

        # Fallback 1: Port 587 (STARTTLS)
        try:
            logger.info(f"Attempting SMTP Port 587 (STARTTLS) for {to_email}")
            with smtplib.SMTP(settings.smtp_host, 587, timeout=12) as server:
                server.ehlo()
                server.starttls()
                server.ehlo()
                server.login(settings.smtp_user, settings.smtp_password)
                server.send_message(msg)
                last_email_error = None
                logger.info(f"OTP sent successfully via 587 to {to_email}")
                return True
        except Exception as e587:
            logger.warning(f"Port 587 failed: {str(e587)}. Trying fallback Port 465 (SSL)...")
            
            # Fallback 2: Port 465 (SSL/TLS)
            try:
                with smtplib.SMTP_SSL(settings.smtp_host, 465, timeout=12) as server:
                    server.login(settings.smtp_user, settings.smtp_password)
                    server.send_message(msg)
                    last_email_error = None
                    logger.info(f"OTP sent successfully via 465 fallback to {to_email}")
                    return True
            except Exception as e465:
                # All fail - Capture final error
                error_details = f"All send methods failed. SMTP 587: {str(e587)} | SMTP 465: {str(e465)}"
                if settings.resend_api_key:
                    error_details += f" | Resend API: {resend_error}"
                
                last_email_error = error_details
                logger.error(f"Critical Email Failure for {to_email}: {error_details}")
                return False
