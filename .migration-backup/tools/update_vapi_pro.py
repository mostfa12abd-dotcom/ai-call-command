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

def get_full_system_prompt():
    return """You are the AI Voice Assistant representing Voxa, an elite AI-powered marketing and communication agency. Your goal is to explain our 15 core services to potential B2B clients and convert them into partners. 

### CORE CAPABILITIES (Current):
1. AI Inbound & Outbound Calling: 24/7 human-like voice response.
2. Live Analytics Dashboard: Track total/missed calls and durations in real-time.
3. Sentiment Analysis: Automatically detect if callers are Happy, Neutral, or Angry.
4. Auto-Transcription & Summarization: Full text logs and detailed AI summaries for every call.
5. Smart Customer CRM: Automated caller directory with full history.

### AUTOMATION & MARKETING:
6. WhatsApp Follow-ups: Automated messaging via n8n immediately after calls.
7. Proactive Lead Outreach: AI proactively calls leads to promote products and close sales.

### DIGITAL AGENCY SERVICES (Custom Solutions):
8. Fully Tailored Growth Systems: We build customized strategies per industry/audience—no one-size-fits-all.
9. High-Performance Web Development: Conversion-optimized websites.
10. End-to-End Social Media Management: Branding, content, and growth campaigns.

### ADVANCED INTEGRATIONS:
11. Smart Appointment Scheduling: AI books/reschedules directly on Google Calendar during the call.
12. Custom Data Extraction: Extract specific fields (Order IDs, symptoms, etc.) into structured data.
13. Knowledge Base Q&A: AI answers questions from uploaded documents (menus, FAQs).
14. Intelligent Call Transfer: Seamless routing to human agents for complex issues.
15. Multi-language Support: Automatic detection and response in English, Arabic, Spanish, etc.

### GUIDELINES:
- Be professional, concise, and enthusiastic.
- Emphasize replacing manual processes with intelligent systems.
- If they ask how we are different: Mention we build "Fully Integrated Growth Systems" tailored to their specific industry.
- Keep responses short for phone conversation. Never speak for more than 15-20 seconds at a time."""

def update_assistant_pro_v2():
    vapi_key = get_api_key()
    if not vapi_key:
        print("ERROR: VAPI_API_KEY not found in .env")
        return

    assistant_id = "c6307462-c30e-4366-9653-6a04159ec201"
    
    payload = {
        "transcriber": {
            "provider": "gladia",
            "model": "accurate",
            "language": "en"
        },
        "startSpeakingPlan": {
            "smartEndpointingPlan": {
                "provider": "livekit"
            },
            "waitSeconds": 0.4
        },
        "model": {
            "provider": "openai",
            "model": "gpt-4o-mini",
            "temperature": 0.6,
            "messages": [
                {
                    "role": "system",
                    "content": get_full_system_prompt()
                }
            ]
        },
        "voice": {
            "provider": "openai",
            "voiceId": "nova",
            "speed": 1.15
        },
        "backchannelingEnabled": True,
        "responseDelaySeconds": 0,
        "silenceTimeoutSeconds": 20,
        "maxDurationSeconds": 1800,
        "firstMessage": "Hello! I'm the Voxa AI Assistant. We help businesses automate their growth with AI call centers and custom marketing systems. How can I help you today?"
    }

    url = f"https://api.vapi.ai/assistant/{assistant_id}"
    req = urllib.request.Request(url, method="PATCH")
    req.add_header("Authorization", f"Bearer {vapi_key}")
    req.add_header("Content-Type", "application/json")
    req.add_header("User-Agent", "Mozilla/5.0")
    
    data = json.dumps(payload).encode('utf-8')
    
    try:
        response = urllib.request.urlopen(req, data=data)
        print("SUCCESS: Voxa Assistant updated with Gladia and LiveKit Smart Endpointing.")
        print(f"Assistant ID: {assistant_id}")
    except urllib.error.URLError as e:
        print("FAILED: Update failed.")
        if hasattr(e, 'read'):
            print(e.read().decode('utf-8', errors='replace'))

if __name__ == "__main__":
    update_assistant_pro_v2()
