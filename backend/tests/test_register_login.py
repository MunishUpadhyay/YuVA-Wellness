import requests
import sys

BASE_URL = "http://localhost:8000/api/auth"
EMAIL = "test_2fa_user_v2@example.com"
PASSWORD = "Test@1234"
PHONE = "9876543210"

def register():
    print(f"Registering {EMAIL}...")
    response = requests.post(f"{BASE_URL}/register", json={
        "email": EMAIL,
        "password": PASSWORD,
        "phone": PHONE
    })
    print(f"Register Status: {response.status_code}")
    print(f"Register Response: {response.text}")
    return response.status_code == 200 or "already registered" in response.text

def login():
    print(f"Logging in {EMAIL}...")
    response = requests.post(f"{BASE_URL}/login", json={
        "identifier": EMAIL,
        "password": PASSWORD
    })
    print(f"Login Status: {response.status_code}")
    if response.status_code == 200:
        data = response.json()
        print(f"Requires OTP: {data.get('requires_otp')}")
        print(f"Temp Token: {data.get('temp_token')}")
    else:
        print(f"Login Failed: {response.text}")

if __name__ == "__main__":
    if register():
        login()
