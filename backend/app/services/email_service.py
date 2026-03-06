"""
Email Service for sending OTPs via Brevo HTTP API
"""
import json
import urllib.request
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
        Send professional HTML OTP email using Brevo HTTP API.
        Returns True if successful, False otherwise.
        """
        global last_email_error
        
        if not settings.brevo_api_key or settings.brevo_api_key == "your-brevo-api-key":
            last_email_error = "Brevo API Key missing or default in configuration"
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

        url = "https://api.brevo.com/v3/smtp/email"
        headers = {
            "api-key": settings.brevo_api_key,
            "Content-Type": "application/json"
        }
        
        # Prepare payload according to Brevo API v3 spec
        payload = {
            "sender": {
                "name": settings.mail_from_name,
                "email": settings.mail_from_address
            },
            "to": [{"email": to_email}],
            "subject": f"{otp} is your YuVA verification code",
            "htmlContent": html_content,
            "textContent": f"Your OTP code is: {otp}"
        }

        try:
            logger.info(f"Sending OTP email via Brevo API to {to_email}")
            
            data = json.dumps(payload).encode("utf-8")
            req = urllib.request.Request(url, data=data, headers=headers, method="POST")
            
            with urllib.request.urlopen(req, timeout=12) as response:
                if response.status in [200, 201, 202]:
                    last_email_error = None
                    logger.info("OTP email sent successfully")
                    return True
                else:
                    error_msg = f"Brevo API error: Status {response.status}"
                    logger.error(error_msg)
                    last_email_error = error_msg
                    return False
                    
        except Exception as e:
            error_msg = f"Brevo API error: {str(e)}"
            last_email_error = error_msg
            logger.error(error_msg)
            return False
