
## AI Call Center SaaS Dashboard

A clean, premium B2B dashboard built with React, Tailwind, shadcn/ui, and Lucide icons. Light gray background, white cards with soft shadows, blue/cyan accents, Inter typography.

### Design System
- **Background:** Soft light gray (`hsl(220 20% 97%)`)
- **Cards:** Pure white, soft drop shadows, subtle border, rounded-xl
- **Primary accent:** Modern blue/cyan (`hsl(210 100% 50%)`)
- **Status colors:** Green (Pickups/Connected), Red (Missed), Amber (Neutral)
- **Font:** Inter via Google Fonts
- **Animations:** Smooth hover lift on cards, row hover highlight, drawer slide-in

### Layout & Navigation
- **Persistent left sidebar** (shadcn Sidebar, collapsible to icon mode) with menu items:
  Dashboard, Customer, Project, Task, Leads, Sales, POS, Automation, AI Studio, **AI Voice Call Center** (active/highlighted), Proposals, Contact, Support, Team, Report, Settings
- **Top header bar** with sidebar trigger, breadcrumb (`AI Voice Call Center › Dashboard`), page title, search input, notification bell, and user avatar
- Fully responsive — sidebar collapses to icons on tablet, off-canvas on mobile

### Page 1: `/dashboard` (Overview) — Landing route
- **6 KPI cards** in a responsive horizontal grid (3 cols on tablet, 6 on desktop). Each card: colored icon chip, label, large bold number, small trend delta (e.g. "+12% this week"):
  1. Total Calls — Phone icon
  2. Avg Call Duration — Clock icon
  3. Missed Calls — PhoneMissed icon (red accent)
  4. Recall AFM — PhoneForwarded icon
  5. Appointments — CalendarCheck icon
  6. Total Call Time — Timer icon
- **Recent Calls table** (shadcn Table) with ~10 realistic mock rows. Columns:
  - Caller (avatar with initials + name)
  - Company
  - Call Duration
  - Status (Badge: green "Pickups", red "Missed")
  - Satisfaction (emoji + label: 😊 Happy, 😐 Neutral, 😠 Angry)
  - Two-Word Summary (e.g. "Pricing Inquiry", "Demo Request", "Refund Issue")
- Rows are fully clickable with hover highlight and pointer cursor

### Slide-over Call Detail Drawer
- Triggered by clicking any table row — shadcn `Sheet` slides in from the right
- Header: caller avatar, name, company, status badge, close (X) button
- Quick stats row: duration, date/time, satisfaction
- **Summary** section — detailed paragraph describing the call
- **Total Conversation** section — full scrollable transcript with alternating Agent/Caller bubbles, timestamps
- Footer actions: "Mark as Reviewed", "Schedule Follow-up"

### Page 2: `/customers`
- Page header with title and "Add Customer" button
- Searchable, sortable table of unique callers:
  - Avatar + Name
  - Company
  - Email / Phone
  - Total Calls
  - Last Contact (date)
  - Status badge
- Realistic mock data (~12 rows)

### Page 3: `/settings`
Tabbed layout (shadcn Tabs):
- **Business Info** — company name, logo upload placeholder, timezone, contact email
- **Dashboard Columns** — toggle switches to show/hide each calls table column (foundation for the JSONB custom-fields concept)
- **API Keys** — masked key display with copy + regenerate buttons
- Save button with toast confirmation

### Mock Data
Realistic seed data lives in a single `src/data/mockData.ts` file so it can later be swapped for Supabase queries with minimal changes. Call records modeled as objects with a `customFields` object (mirroring the future JSONB column) holding satisfaction, summary, and transcript.

### Routing
- `/` redirects to `/dashboard`
- `/dashboard`, `/customers`, `/settings` all wrapped in a shared `DashboardLayout` (sidebar + header)
- Active sidebar item highlighted via `NavLink`

### Out of scope (mention only)
- Actual Supabase integration / auth — UI is structured so it's drop-in ready, but no backend wiring in this pass. Happy to add Lovable Cloud auth + tables in a follow-up.
