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

def read_prompt():
    prompt = """You are the AI Voice Assistant representing Voxa, a modern, AI-powered marketing and communication agency. Your goal is to explain our services to potential B2B clients and convince them to partner with us. 

Tell them we provide intelligent call center solutions where AI handles inbound and outbound communication 24/7. Mention our live dashboard with call transcripts, sentiment analysis, and automated WhatsApp follow-ups. Explain that our AI can proactively reach out to leads and close sales. 

Beyond AI calling, emphasize that we build fully tailored growth systems for each business, including high-performance web development and end-to-end social media management. If they ask for more technical details, mention capabilities like smart appointment scheduling, custom data extraction, and intelligent call routing. Be professional, concise, and enthusiastic about how Voxa can replace manual processes, reduce costs, and maximize their revenue."""
    return prompt

def update_assistant():
    vapi_key = get_api_key()
    if not vapi_key:
        print("ERROR: VAPI_API_KEY not found in .env")
        return

    assistant_id = "c6307462-c30e-4366-9653-6a04159ec201"
    prompt_text = read_prompt()
    
    payload = {
        "transcriber": {
            "provider": "deepgram",
            "model": "nova-2",
            "language": "en"
        },
        "model": {
            "provider": "openai",
            "model": "gpt-4o-mini",
            "temperature": 0.6,
            "messages": [
                {
                    "role": "system",
                    "content": prompt_text
                }
            ]
        },
        "voice": {
            "provider": "openai",
            "voiceId": "nova",
            "speed": 1.1
        },
        "backgroundSound": "office",
        "silenceTimeoutSeconds": 15,
        "responseDelaySeconds": 0.4,
        "maxDurationSeconds": 1800,
        "firstMessage": "Hi there! I'm the Voxa AI Assistant. How can I help you transform your business communication today?"
    }

    url = f"https://api.vapi.ai/assistant/{assistant_id}"
    
    req = urllib.request.Request(url, method="PATCH")
    req.add_header("Authorization", f"Bearer {vapi_key}")
    req.add_header("Content-Type", "application/json")
    req.add_header("User-Agent", "Mozilla/5.0")
    
    data = json.dumps(payload).encode('utf-8')
    
    try:
        response = urllib.request.urlopen(req, data=data)
        result = json.loads(response.read())
        print("SUCCESS: Successfully applied Ultimate Realism Settings to Voxa Sales Assistant!")
        print(f"Assistant ID: {result.get('id')}")
    except urllib.error.URLError as e:
        print("FAILED: to update assistant!")
        print(f"Error: {e.reason}")
        if hasattr(e, 'read'):
            print(e.read().decode('utf-8', errors='replace'))

if __name__ == "__main__":
    update_assistant()
