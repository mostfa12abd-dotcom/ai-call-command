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
    prompt = "You are the AI Voice Assistant representing Voxa, a cutting-edge B2B SaaS platform for AI call centers. Your goal is to explain our services to potential business clients. Tell them we provide a live dashboard with call transcripts, sentiment analysis, and automated WhatsApp follow-ups after calls. If they ask for more, mention our capabilities in smart appointment scheduling, custom data extraction, and intelligent call routing to human agents. Be professional, concise, and enthusiastic about how Voxa can save them time and money. Keep your answers brief for a conversational phone environment."
    return prompt

def create_assistant():
    vapi_key = get_api_key()
    if not vapi_key:
        print("❌ Error: VAPI_API_KEY not found in .env")
        return

    prompt_text = read_prompt()

    payload = {
        "name": "Voxa Sales Assistant",
        "firstMessage": "Welcome to Voxa AI! I am your intelligent call center assistant. How can I help you today?",
        "model": {
            "provider": "openai",
            "model": "gpt-4",
            "messages": [
                {
                    "role": "system",
                    "content": prompt_text
                }
            ]
        },
        "voice": {
            "provider": "openai",
            "voiceId": "nova"
        }
    }

    url = "https://api.vapi.ai/assistant"
    
    req = urllib.request.Request(url, method="POST")
    req.add_header("Authorization", f"Bearer {vapi_key}")
    req.add_header("Content-Type", "application/json")
    req.add_header("User-Agent", "Mozilla/5.0")
    
    data = json.dumps(payload).encode('utf-8')
    
    try:
        response = urllib.request.urlopen(req, data=data)
        result = json.loads(response.read())
        print("SUCCESS: Successfully created Voxa Sales Assistant in VAPI!")
        print(f"Assistant ID: {result.get('id')}")
        print("You can now assign this Assistant ID to a phone number in your VAPI dashboard.")
    except urllib.error.URLError as e:
        print("FAILED: to create assistant!")
        print(f"Error: {e.reason}")
        if hasattr(e, 'read'):
            print(e.read().decode('utf-8', errors='replace'))

if __name__ == "__main__":
    create_assistant()
