import os
import urllib.request
import urllib.error
import json

def test_vapi_connection():
    # Read API key from .env manually to avoid external dependencies like python-dotenv if not installed
    vapi_key = None
    with open('.env', 'r') as f:
        for line in f:
            if line.startswith('VAPI_API_KEY='):
                vapi_key = line.strip().split('=', 1)[1]
                break

    if not vapi_key:
        print("❌ Error: VAPI_API_KEY not found in .env")
        return

    # VAPI Assistants endpoint
    url = "https://api.vapi.ai/assistant"
    
    req = urllib.request.Request(url, method="GET")
    req.add_header("Authorization", f"Bearer {vapi_key}")
    req.add_header("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36")
    
    try:
        response = urllib.request.urlopen(req)
        data = json.loads(response.read())
        print("SUCCESS: VAPI Connection Successful!")
        print(f"Status Code: {response.getcode()}")
        print(f"You currently have {len(data)} assistants configured.")
    except urllib.error.URLError as e:
        print("ERROR: VAPI Connection Failed!")
        print(f"Error: {e.reason}")
        if hasattr(e, 'read'):
            print(e.read().decode('utf-8', errors='replace'))

if __name__ == "__main__":
    test_vapi_connection()
