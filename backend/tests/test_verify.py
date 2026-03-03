import requests
import sys

BASE_URL = "http://localhost:8000/api/auth"

def verify(temp_token, otp):
    print(f"Verifying OTP {otp}...")
    response = requests.post(f"{BASE_URL}/verify-otp", json={
        "temp_token": temp_token,
        "otp": otp
    })
    print(f"Verify Status: {response.status_code}")
    if response.status_code == 200:
        data = response.json()
        print(f"Access Token: {data.get('access_token')}")
        print("2FA SUCCESS!")
        return True
    else:
        print(f"Verify Failed: {response.text}")
        return False

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: python test_verify.py <temp_token> <otp>")
        sys.exit(1)
    
    temp_token = sys.argv[1]
    otp = sys.argv[2]
    verify(temp_token, otp)
