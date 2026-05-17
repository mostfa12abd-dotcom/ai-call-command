# Project Task List

## [Bug Fixes] Agent Test Failures #4
- [x] Fix GPT-4o-mini Base64 ID Hallucinations by implementing numeric ID Translator (`outlook_client.py`)
- [x] Restart bot

## [Bug Fixes] Agent Test Failures #3
- [x] Stop AI from hallucinating draft creations in plain text (updated SYSTEM_PROMPT)
- [x] Prevent AI from getting stuck in "Would you like to send it?" loop (updated tool response notes)
- [x] Restart bot

## [Bug Fixes] Agent Test Failures #2
- [x] Fix SYSTEM_PROMPT format typo (`{{ $today }}` -> `{today}`)
- [x] Move `subject_contains` from OData to client filter (prevents 400 Bad Request)
- [x] Restart bot to apply fixes

## [Bug Fixes] Agent Test Failures #1
- [x] Remove ALL demo/mock data from every tool
- [x] Fix SYSTEM_PROMPT time-period rule (too strict for 'today')
- [x] Fix draft ID memory (use `get_drafts` to recover IDs)
- [x] Delete `_mock_emails()` and `_mock_calendar()` methods

## [Completed Previously]
- [x] Fix OData Date Filter Bypass in `get_emails`
- [x] Implement Event Conflict Validation in `create_event`
- [x] Add `mark_as_read` tool
- [x] Fix `get_emails` filtering (Sender, Date/Timezone, Pagination)
- [x] Integrate strict agent rules into `orchestrator.py`
- [x] Create Telegram Tester script
- [x] Remove '🤔 Working on it...' placeholder message
- [x] Fix duplicate scheduled tasks (deterministic job IDs)
- [x] Fix zombie job deletion crash
- [x] Add `delete_scheduled_task` tool
- [x] Apply user feedback from annotated instructions file
