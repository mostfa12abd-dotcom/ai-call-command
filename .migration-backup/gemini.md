# Project Constitution (gemini.md) - Voxa Call Center

## 1. Project Goal (North Star)
Building a B2B SaaS AI Call Center platform (Voxa). Businesses sign up, configure their settings, and AI agents handle their inbound/outbound calls. The dashboard displays the analytics, transcripts, and summaries of these calls in real-time.

## 2. Behavioral Rules & System Pilot Protocols
- **No GUI Guesswork:** Always rely on specific paths, known components, and `console.log` rather than visual layout assumptions.
- **Data-First:** No tool script or ingestion endpoint can be built until the exact JSON payload from the source (VAPI) is defined in this document.
- **Three-Layer Architecture:** 
  1. `architecture/`: Holds the SOPs and markdown guides for how logic flows.
  2. **Navigation:** The AI's routing and planning process.
  3. `tools/`: Atomic executable scripts (none built yet for backend).
- **JSONB over Migrations:** Use the `custom_data` and `features` columns for client-specific fields (e.g., healthcare symptoms vs restaurant orders) rather than altering the core table schema.

## 3. Data Schemas (The Source of Truth)

### A. Supabase Database Schema
*All tables have RLS enabled and restrict access to `auth.uid() = tenant_id` or `id`.*

- **`tenant_settings`**
  - `id` (uuid) - Maps to auth.users.id
  - `business_name` (text)
  - `features` (jsonb) - e.g., `{"enable_sms": true, "industry": "healthcare"}`
  - `created_at` (timestamp)
- **`customers`**
  - `id` (uuid)
  - `tenant_id` (uuid)
  - `name` (text)
  - `phone` (text)
  - `company` (text)
  - `created_at` (timestamp)
- **`calls`**
  - `id` (uuid)
  - `tenant_id` (uuid)
  - `caller_name` (text)
  - `company` (text)
  - `call_duration` (int) - In seconds
  - `status` (text) - e.g., "Pickup", "Missed"
  - `satisfaction` (text) - "High", "Medium", "Low"
  - `two_word_summary` (text)
  - `total_conversation` (text) - Raw transcript
  - `detailed_summary` (text)
  - `custom_data` (jsonb) - e.g., `{"appointment_date": "...", "order_id": "..."}`
  - `created_at` (timestamp)

### B. Payload Schemas (Pending Discovery)
*Waiting on user input to define the incoming JSON structure from VAPI/n8n.*
