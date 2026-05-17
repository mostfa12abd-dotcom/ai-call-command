# Fix: Base64 ID Hallucinations

## Root Cause Analysis
The user requested a switch to the faster/smaller `gpt-4o-mini` model. During testing, the `reply_to_email` tool failed with `reply_draft_failed`.
Looking at the trace, the AI hallucinated the 152-character Microsoft Graph API `email_id` when it passed it back to the tool:
- **Actual ID:** `...ODQt...`
- **AI's ID:** `...YjQt...`

Because the ID is extremely long and entirely unstructured base64 strings, small models struggle to consistently copy it perfectly, leading to 404 errors.

## Proposed Changes

### [MODIFY] [outlook_client.py](file:///C:/Users/aabda/OneDrive/Desktop/DA%20Project/tools/outlook_client.py)
Implement a persistent two-way "ID Mapper" that abstracts the absurdly long Microsoft IDs into simple numeric strings (e.g., `id_1`, `id_2`) for the AI. This eliminates hallucinations and saves significant tokens.

1. **Add Mapper Logic:**
   - Create `_register_id(self, real_id)` to map long IDs to `f"id_{counter}"` and save to `.tmp/id_map.json` persistently.
   - Create `_resolve_id(self, short_id)` to map the AI's input back to the real Microsoft ID before hitting the Graph API.

2. **Intercept Outgoing IDs (Microsoft -> AI):**
   - In `_normalise_email`, wrap the returned `id`.
   - In `get_drafts`, wrap the returned `id`.
   - In `create_draft` and `create_reply_draft`, wrap the returned `draft_id`.
   - In `get_calendar_events`, wrap the returned `id`.

3. **Intercept Incoming IDs (AI -> Microsoft):**
   - Apply `_resolve_id()` to all ID parameters entering the tools: `get_email_body`, `mark_as_read`, `reply_to_email`, `send_draft`, `update_draft`, `delete_draft`, `update_event`, `delete_event`.

## Verification Plan
1. Restart the bot (`python main.py`).
2. Have the user ask: "Read the Lab 4 security email. Draft a reply...".
3. Check the tool calls to verify the AI now sees and uses short IDs like `id_1` instead of the 152-char base64 blob, and that the reply draft successfully creates without failing.
