# 🟣 Lovable Prompt — AI Call Center SaaS Dashboard

> انسخ كل النص أدناه وألصقه في Lovable مباشرة

---

```
Build a full SaaS dashboard for an AI Call Center platform called "CallMind AI". 
This is a B2B platform where each business client logs in and sees their own 
call center analytics. The dashboard is connected to Supabase as the backend.

---

## 🎨 Design Requirements
- Dark mode by default (deep navy/dark gray background, NOT pure black)
- Use glassmorphism cards with subtle blur and border
- Primary accent color: electric violet/purple (#7C3AED) with gradient to (#4F46E5)
- Secondary accent: emerald green (#10B981) for positive metrics
- Red (#EF4444) for negative/alerts
- Font: Inter (from Google Fonts)
- Smooth hover animations on all cards and buttons
- Sidebar navigation (collapsible)
- Fully responsive (desktop + mobile)
- Arabic support (RTL-ready layout, but default LTR)

---

## 📁 Pages & Route Structure

### 1. /dashboard (Overview Page) — Main landing after login
Show these KPI cards at the top:
- Total Calls Today (with trend arrow vs yesterday)
- Total Calls This Month
- Satisfaction Score (percentage with color: green if >70%, red if <50%)
- New Leads This Week
- Appointments Booked This Month
- Unhappy Customers (calls with negative sentiment)

Below the KPIs show:
- A line chart: "Calls per Day" (last 30 days)
- A donut/pie chart: "Call Intent Breakdown" (Inquiry / Booking / Complaint / Other)
- A bar chart: "Satisfaction Score per Week"
- A table: "Recent Calls" (last 5) with columns: Date, Duration, Summary, Sentiment badge

### 2. /calls (All Calls Page)
- A searchable, filterable table of all calls
- Columns: Date & Time, Duration, Caller (if known), Intent, Sentiment (badge: Positive/Neutral/Negative), Summary
- Each row is expandable or has a "View" button that opens a drawer/modal with:
  - Full transcript
  - Audio player (for the recording)
  - Full AI-generated summary
  - Lead info (if any)
  - Tags
- Filters: Date range, Sentiment, Intent type
- Export to CSV button

### 3. /leads (Leads Page)
- Table of all extracted leads from calls
- Columns: Name, Phone, Interest, Source Call Date, Status (New / Contacted / Converted / Lost)
- Status is a dropdown you can change per lead
- Search and filter by status

### 4. /appointments (Appointments Page)
- Toggle between Calendar view and Table view
- Calendar shows booked appointments as colored events
- Table view: Date, Time, Client Name, Purpose, Status (Upcoming / Completed / Cancelled)
- Ability to mark as completed or cancelled

### 5. /analytics (Analytics Page)
- Deeper charts and trends:
  - Monthly call volume trend (12 months)
  - Average call duration trend
  - Lead conversion rate over time
  - Top call intents over time (stacked bar)
  - Satisfaction heatmap by day of week and hour
- Summary cards: Best performing day, Peak call hour, Average response satisfaction

### 6. /settings (Settings Page)
Tabs inside:
- **Business Info**: Company name, phone number, business type, working hours
- **AI Agent**: System prompt preview (read-only), voice model info, webhook URL
- **Notifications**: Toggle Email/WhatsApp alerts for new leads, unhappy customers, appointments
- **Account**: Email, password change, plan info

---

## 🔐 Authentication
- Login page at /login (email + password)
- Signup page at /signup
- After login, redirect to /dashboard
- Use Supabase Auth
- Each user is tied to one business (via profiles table in Supabase)
- If not logged in, redirect all routes to /login

---

## 🗄️ Supabase Integration
Connect to Supabase with these tables (read-only from the dashboard side, writes come from n8n):

**businesses**: id, name, type, phone, working_hours, created_at
**calls**: id, business_id, date, duration_seconds, transcript, summary, sentiment (positive/neutral/negative), intent (inquiry/booking/complaint/other), recording_url, caller_phone, created_at
**leads**: id, business_id, call_id, name, phone, interest, status, created_at
**appointments**: id, business_id, call_id, client_name, date, time, purpose, status, created_at
**profiles**: id (= auth.uid), business_id, email, full_name

All queries must filter by the logged-in user's business_id (via RLS in Supabase).

---

## 🧩 Component Notes
- Use Recharts for all charts
- Use shadcn/ui components (already available in Lovable)
- Sidebar should show: Overview, Calls, Leads, Appointments, Analytics, Settings
- Sidebar bottom: User avatar + name + logout button
- Top bar: Page title + Search (global) + Notification bell
- Use skeleton loaders while data is loading
- Empty states with icons when no data (e.g. "No calls yet")
- Toast notifications for actions (e.g. lead status updated)

---

## 📊 Mock Data
Use realistic mock data so the dashboard looks populated and impressive on first load.
Include ~20 mock calls, ~8 leads, ~5 appointments spread across the last 30 days.
Mix of sentiments and intents. Make the data look like a real Saudi business 
(use Arabic names for callers/leads but English for UI labels).

---

Start by creating the full project structure, then implement the Overview page 
and Sidebar first, then all other pages. Make it look absolutely stunning and 
professional — this is a premium B2B SaaS product.
```
