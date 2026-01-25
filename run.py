#!/usr/bin/env python3
"""
Simple startup script for YuVA Wellness App
"""
import os
import sys
import uvicorn

# Add current directory to Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

if __name__ == "__main__":
    print("🧠 Starting YuVA Wellness Companion...")
    
    # Use PORT from environment (Render provides this)
    port = int(os.environ.get("PORT", 8000))
    
    print(f"📱 Access the app at: http://localhost:{port}")
    print(f"📚 API docs at: http://localhost:{port}/docs")
    print("🛑 Press Ctrl+C to stop")
    
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=port,
        reload=False  # Disable reload in production
    )
