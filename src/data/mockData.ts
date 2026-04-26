// Mock data layer. Shaped to mirror the future Supabase schema:
// `leads` and `calls` tables with a JSONB `custom_fields` column for
// per-client customization (status, next action, satisfaction, transcript).

export type LeadStatus =
  | "New"
  | "Qualified"
  | "Contacted"
  | "Paid"
  | "Not Interested";

export type Satisfaction = "Happy" | "Neutral" | "Angry";

export interface TranscriptLine {
  speaker: "Agent" | "Caller";
  time: string;
  text: string;
}

export interface LeadRecord {
  id: string;
  name: string;
  initials: string;
  avatarColor: string;
  company: string;
  phone: string;
  email: string;
  status: LeadStatus;
  nextAction: string;
  lastCall: {
    duration: string;
    date: string;
    satisfaction: Satisfaction;
    summary: string;
    longSummary: string;
    transcript: TranscriptLine[];
  };
}

const palette = [
  "bg-blue-100 text-blue-700",
  "bg-emerald-100 text-emerald-700",
  "bg-amber-100 text-amber-700",
  "bg-rose-100 text-rose-700",
  "bg-violet-100 text-violet-700",
  "bg-cyan-100 text-cyan-700",
  "bg-indigo-100 text-indigo-700",
  "bg-pink-100 text-pink-700",
];

const initialsOf = (name: string) =>
  name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

const makeTranscript = (topic: string): TranscriptLine[] => [
  { speaker: "Agent", time: "00:00", text: `Hi, this is Aria from Voxa. Is now a good time for a quick chat?` },
  { speaker: "Caller", time: "00:05", text: `Sure, what's this regarding?` },
  { speaker: "Agent", time: "00:09", text: `I'm following up on your interest in ${topic.toLowerCase()}.` },
  { speaker: "Caller", time: "00:16", text: `Right, I remember signing up. Tell me more.` },
  { speaker: "Agent", time: "00:22", text: `Happy to. We help teams automate outbound calls with AI agents.` },
  { speaker: "Caller", time: "00:34", text: `That sounds useful. What does pricing look like?` },
  { speaker: "Agent", time: "00:39", text: `Plans start at $99/mo. I can send a tailored quote after a quick demo.` },
  { speaker: "Caller", time: "00:51", text: `Let's schedule a demo for next week then.` },
  { speaker: "Agent", time: "00:56", text: `Perfect — I'll send a calendar invite within the hour.` },
  { speaker: "Caller", time: "01:02", text: `Great, talk soon.` },
];

const seed: Array<[string, string, string, LeadStatus, string, string, Satisfaction, string]> = [
  ["Niki Nalinto", "Business Solutions", "+1-555-0103", "Not Interested", "Initial contact", "01:42", "Angry", "Cold Lead"],
  ["Marcus Johnson", "Innovate LLC", "+1-555-0118", "Qualified", "Send proposal", "06:14", "Happy", "Pricing Inquiry"],
  ["Priya Patel", "Tech Corp", "+1-555-0142", "New", "Initial contact", "00:00", "Neutral", "First Touch"],
  ["David Kim", "Digital Inc", "+1-555-0155", "Paid", "Schedule demo", "08:31", "Happy", "Renewal Confirmed"],
  ["Elena Rodriguez", "Business Solutions", "+1-555-0167", "Contacted", "Archive", "03:05", "Neutral", "Follow Up"],
  ["James O'Brien", "Innovate LLC", "+1-555-0173", "New", "Closing call", "04:48", "Happy", "Demo Scheduled"],
  ["Aisha Thompson", "Business Solutions", "+1-555-0186", "Not Interested", "Follow-up call", "00:52", "Angry", "Hard Pass"],
  ["Lukas Schmidt", "Tech Corp", "+1-555-0192", "Qualified", "Send proposal", "07:22", "Happy", "Strong Fit"],
  ["Mei Wong", "Digital Inc", "+1-555-0204", "Paid", "Onboarding", "11:04", "Happy", "Onboarding Help"],
  ["Rafael Costa", "Innovate LLC", "+1-555-0215", "Contacted", "Schedule demo", "02:41", "Neutral", "Technical Review"],
  ["Hannah Müller", "Business Solutions", "+1-555-0226", "New", "Initial contact", "00:00", "Neutral", "Cold Outreach"],
  ["Tomás Alvarez", "Tech Corp", "+1-555-0238", "Qualified", "Send proposal", "05:47", "Happy", "Budget Approved"],
];

export const leads: LeadRecord[] = seed.map(
  ([name, company, phone, status, nextAction, duration, satisfaction, summary], i) => ({
    id: `ld-${(i + 1).toString().padStart(3, "0")}`,
    name,
    initials: initialsOf(name),
    avatarColor: palette[i % palette.length],
    company,
    phone,
    email: `${name.toLowerCase().replace(/[^a-z]/g, ".")}@${company.toLowerCase().replace(/[^a-z]/g, "")}.com`,
    status,
    nextAction,
    lastCall: {
      duration,
      date: `Apr ${26 - (i % 4)}, 2026 · ${9 + (i % 8)}:${(i * 7) % 60 < 10 ? "0" : ""}${(i * 7) % 60}`,
      satisfaction,
      summary,
      longSummary: `${name} from ${company} discussed ${summary.toLowerCase()} during the most recent call. The agent walked through key points, addressed objections, and agreed on the next step: "${nextAction}". Overall sentiment trended ${satisfaction.toLowerCase()}.`,
      transcript: makeTranscript(summary),
    },
  }),
);

export interface CustomerRecord {
  id: string;
  name: string;
  initials: string;
  avatarColor: string;
  company: string;
  email: string;
  phone: string;
  totalCalls: number;
  lastContact: string;
  status: "Active" | "Lead" | "Churned";
}

export const customers: CustomerRecord[] = leads.map((l, i) => ({
  id: `cust-${(i + 1).toString().padStart(3, "0")}`,
  name: l.name,
  initials: l.initials,
  avatarColor: l.avatarColor,
  company: l.company,
  email: l.email,
  phone: l.phone,
  totalCalls: 3 + ((i * 5) % 22),
  lastContact: l.lastCall.date.split(" · ")[0],
  status: l.status === "Paid" ? "Active" : l.status === "Not Interested" ? "Churned" : "Lead",
}));

export const kpis = {
  connected: 3,
  missed: 0,
  avgDuration: "0m 23s",
  totalCalls: 742,
};
