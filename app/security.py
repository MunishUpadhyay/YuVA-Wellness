"""
Security utilities and rate limiting
"""
from fastapi import HTTPException, Request
from typing import Dict
import time
from collections import defaultdict, deque


class RateLimiter:
    """Simple in-memory rate limiter"""
    
    def __init__(self, max_requests: int = 100, window_seconds: int = 3600):
        self.max_requests = max_requests
        self.window_seconds = window_seconds
        self.requests: Dict[str, deque] = defaultdict(deque)
    
    def is_allowed(self, identifier: str) -> bool:
        """Check if request is allowed for given identifier"""
        now = time.time()
        window_start = now - self.window_seconds
        
        # Clean old requests
        user_requests = self.requests[identifier]
        while user_requests and user_requests[0] < window_start:
            user_requests.popleft()
        
        # Check if under limit
        if len(user_requests) >= self.max_requests:
            return False
        
        # Add current request
        user_requests.append(now)
        return True
    
    def get_remaining(self, identifier: str) -> int:
        """Get remaining requests for identifier"""
        return max(0, self.max_requests - len(self.requests[identifier]))


# Global rate limiter instances
api_limiter = RateLimiter(max_requests=100, window_seconds=3600)  # 100 requests per hour
chat_limiter = RateLimiter(max_requests=50, window_seconds=3600)   # 50 chat requests per hour


def get_client_ip(request: Request) -> str:
    """Get client IP address"""
    forwarded = request.headers.get("X-Forwarded-For")
    if forwarded:
        return forwarded.split(",")[0].strip()
    return request.client.host if request.client else "unknown"


def check_rate_limit(request: Request, limiter: RateLimiter = api_limiter):
    """Check rate limit for request"""
    client_ip = get_client_ip(request)
    
    if not limiter.is_allowed(client_ip):
        raise HTTPException(
            status_code=429,
            detail={
                "error": "Rate limit exceeded",
                "message": "Too many requests. Please try again later.",
                "retry_after": limiter.window_seconds
            }
        )
    
    return limiter.get_remaining(client_ip)


def sanitize_input(text: str, max_length: int = 10000) -> str:
    """Basic input sanitization"""
    if not text:
        return ""
    
    # Remove potential XSS characters
    dangerous_chars = ["<script", "</script", "javascript:", "onload=", "onerror="]
    sanitized = text
    
    for char in dangerous_chars:
        sanitized = sanitized.replace(char, "")
    
    # Limit length
    if len(sanitized) > max_length:
        sanitized = sanitized[:max_length]
    
    return sanitized.strip()