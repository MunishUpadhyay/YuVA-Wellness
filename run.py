#!/usr/bin/env python3
"""
Simple startup script for YuVA Wellness App
"""
import uvicorn

if __name__ == "__main__":
    print("🧠 Starting YuVA Wellness Companion...")
    print("📱 Access the app at: http://localhost:8000")
    print("📚 API docs at: http://localhost:8000/docs")
    print("🛑 Press Ctrl+C to stop")
    
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True
    )