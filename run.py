#!/usr/bin/env python3
"""
Simple startup script for YuVA Wellness App
"""
import os
import sys
import uvicorn

# Add the current directory to Python path to ensure imports work
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    
    print("🧠 Starting YuVA Wellness Companion...")
    print(f"📱 Access the app at: http://0.0.0.0:{port}")
    print(f"📚 API docs at: http://0.0.0.0:{port}/docs")
    print("🛑 Press Ctrl+C to stop")
    
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=port,
        reload=False  # Disable reload in production
    )