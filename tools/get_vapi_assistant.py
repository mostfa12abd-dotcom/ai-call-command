import os
import urllib.request
import urllib.error
import json

def get_api_key():
    with open('.env', 'r') as f:
        for line in f:
            if line.startswith('VAPI_API_KEY='):
                return line.strip().split('=', 1)[1]
    return None

def fetch_current_assistant():
    vapi_key = get_api_key()
    if not vapi_key:
        print("ERROR: VAPI_API_KEY not found in .env")
        return

    assistant_id = "c6307462-c30e-4366-9653-6a04159ec201"
    url = f"https://api.vapi.ai/assistant/{assistant_id}"
    
    req = urllib.request.Request(url, method="GET")
    req.add_header("Authorization", f"Bearer {vapi_key}")
    req.add_header("User-Agent", "Mozilla/5.0")
    
    try:
        response = urllib.request.urlopen(req)
        result = json.loads(response.read())
        print("--- CURRENT ASSISTANT CONFIGURATION ---")
        print(json.dumps(result, indent=4))
        print("----------------------------------------")
    except urllib.error.URLError as e:
        print("FAILED: Fetch failed.")
        if hasattr(e, 'read'):
            print(e.read().decode('utf-8', errors='replace'))

if __name__ == "__main__":
    fetch_current_assistant()
