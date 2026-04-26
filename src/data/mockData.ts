// Mock data layer. Shaped to mirror the future Supabase schema:
// `calls` table will hold core fields + a JSONB `custom_fields` column for
// per-client customization (satisfaction, summary, transcript, etc.).

export type CallStatus = "Pickups" | "Missed";
export type Satisfaction = "Happy" | "Neutral" | "Angry";

export interface TranscriptLine {
  speaker: "Agent" | "Caller";
  time: string;
  text: string;
}

export interface CallRecord {
  id: string;
  caller: {
    name: string;
    initials: string;
    avatarColor: string;
  };
  company: string;
  phone: string;
  email: string;
  duration: string; // mm:ss
  durationSeconds: number;
  status: CallStatus;
  date: string;
  customFields: {
    satisfaction: Satisfaction;
    summary: string; // two-word badge text
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
  { speaker: "Agent", time: "00:00", text: `Thanks for calling Voxa support, this is Aria. How can I help you today?` },
  { speaker: "Caller", time: "00:06", text: `Hi Aria, I'm calling about ${topic.toLowerCase()} on my account.` },
  { speaker: "Agent", time: "00:12", text: `Got it — let me pull up your account. Can I confirm your email on file?` },
  { speaker: "Caller", time: "00:19", text: `Yes, it's the same one I used to sign up.` },
  { speaker: "Agent", time: "00:24", text: `Perfect, I see it here. Walk me through what's happening.` },
  { speaker: "Caller", time: "00:31", text: `So when I try to access the feature, it just hangs and never loads.` },
  { speaker: "Agent", time: "00:42", text: `Understood. I'm going to run a quick diagnostic — one moment please.` },
  { speaker: "Caller", time: "01:05", text: `No problem, take your time.` },
  { speaker: "Agent", time: "01:18", text: `Okay, I found the issue. We had a temporary regional outage that's now resolved.` },
  { speaker: "Caller", time: "01:28", text: `Oh great. Should I do anything on my end?` },
  { speaker: "Agent", time: "01:33", text: `Just refresh the page and you should be all set. Anything else I can help with?` },
  { speaker: "Caller", time: "01:40", text: `No, that's it. Thanks so much for the quick fix!` },
  { speaker: "Agent", time: "01:44", text: `My pleasure. Have a wonderful rest of your day.` },
];

export const calls: CallRecord[] = [
  {
    id: "c-001",
    caller: { name: "Sarah Chen", initials: initialsOf("Sarah Chen"), avatarColor: palette[0] },
    company: "Stripe",
    phone: "+1 (415) 555-0142",
    email: "sarah.chen@stripe.com",
    duration: "04:32",
    durationSeconds: 272,
    status: "Pickups",
    date: "Apr 26, 2026 · 09:14",
    customFields: {
      satisfaction: "Happy",
      summary: "Pricing Inquiry",
      longSummary:
        "Sarah from Stripe inquired about enterprise pricing for the Pro plan. She was particularly interested in volume discounts for >500 seats and SOC 2 documentation. The agent walked her through tiered pricing, sent the security packet, and scheduled a follow-up demo for next Tuesday.",
      transcript: makeTranscript("enterprise pricing"),
    },
  },
  {
    id: "c-002",
    caller: { name: "Marcus Johnson", initials: initialsOf("Marcus Johnson"), avatarColor: palette[1] },
    company: "Linear",
    phone: "+1 (628) 555-0119",
    email: "marcus@linear.app",
    duration: "00:00",
    durationSeconds: 0,
    status: "Missed",
    date: "Apr 26, 2026 · 08:47",
    customFields: {
      satisfaction: "Angry",
      summary: "Billing Issue",
      longSummary:
        "Marcus called about an unexpected charge on his April invoice. The call was missed during peak hours. Voicemail indicated frustration about being unable to reach support and threatened to cancel his subscription if not contacted by EOD.",
      transcript: makeTranscript("a billing discrepancy"),
    },
  },
  {
    id: "c-003",
    caller: { name: "Priya Patel", initials: initialsOf("Priya Patel"), avatarColor: palette[2] },
    company: "Notion",
    phone: "+1 (212) 555-0188",
    email: "priya.p@notion.so",
    duration: "07:18",
    durationSeconds: 438,
    status: "Pickups",
    date: "Apr 26, 2026 · 08:22",
    customFields: {
      satisfaction: "Happy",
      summary: "Demo Request",
      longSummary:
        "Priya, a product manager at Notion, requested a personalized demo of the AI Voice analytics module. She's evaluating three vendors and Voxa is the frontrunner. Demo scheduled for Friday with her engineering lead joining.",
      transcript: makeTranscript("a product demo"),
    },
  },
  {
    id: "c-004",
    caller: { name: "David Kim", initials: initialsOf("David Kim"), avatarColor: palette[3] },
    company: "Figma",
    phone: "+1 (917) 555-0173",
    email: "dkim@figma.com",
    duration: "02:41",
    durationSeconds: 161,
    status: "Pickups",
    date: "Apr 25, 2026 · 17:55",
    customFields: {
      satisfaction: "Neutral",
      summary: "Feature Question",
      longSummary:
        "David asked whether the platform supports multi-language transcription, specifically Korean and Japanese. The agent confirmed support for 38 languages including both, and shared documentation links.",
      transcript: makeTranscript("language support"),
    },
  },
  {
    id: "c-005",
    caller: { name: "Elena Rodriguez", initials: initialsOf("Elena Rodriguez"), avatarColor: palette[4] },
    company: "Vercel",
    phone: "+1 (646) 555-0156",
    email: "elena@vercel.com",
    duration: "11:04",
    durationSeconds: 664,
    status: "Pickups",
    date: "Apr 25, 2026 · 16:03",
    customFields: {
      satisfaction: "Happy",
      summary: "Onboarding Help",
      longSummary:
        "Elena's team just signed up and needed help configuring inbound routing and IVR menus. The agent walked her through setup over screen-share, configured 4 menus, and tested call flows successfully.",
      transcript: makeTranscript("onboarding configuration"),
    },
  },
  {
    id: "c-006",
    caller: { name: "James O'Brien", initials: initialsOf("James OBrien"), avatarColor: palette[5] },
    company: "Datadog",
    phone: "+1 (303) 555-0192",
    email: "jobrien@datadog.com",
    duration: "00:00",
    durationSeconds: 0,
    status: "Missed",
    date: "Apr 25, 2026 · 14:38",
    customFields: {
      satisfaction: "Neutral",
      summary: "Quick Callback",
      longSummary:
        "James left a brief voicemail asking for a callback to discuss API rate limits. No urgency expressed; left direct extension.",
      transcript: makeTranscript("API rate limits"),
    },
  },
  {
    id: "c-007",
    caller: { name: "Aisha Thompson", initials: initialsOf("Aisha Thompson"), avatarColor: palette[6] },
    company: "Shopify",
    phone: "+1 (416) 555-0167",
    email: "aisha.t@shopify.com",
    duration: "05:47",
    durationSeconds: 347,
    status: "Pickups",
    date: "Apr 25, 2026 · 13:12",
    customFields: {
      satisfaction: "Happy",
      summary: "Renewal Discussion",
      longSummary:
        "Aisha confirmed early renewal of their annual contract and added two additional seats. She praised the new analytics dashboard and asked about beta access to the upcoming sentiment-trend feature.",
      transcript: makeTranscript("contract renewal"),
    },
  },
  {
    id: "c-008",
    caller: { name: "Lukas Schmidt", initials: initialsOf("Lukas Schmidt"), avatarColor: palette[7] },
    company: "GitLab",
    phone: "+49 30 555 0144",
    email: "lschmidt@gitlab.com",
    duration: "03:22",
    durationSeconds: 202,
    status: "Pickups",
    date: "Apr 25, 2026 · 11:28",
    customFields: {
      satisfaction: "Angry",
      summary: "Refund Issue",
      longSummary:
        "Lukas reported being double-charged for the March cycle. Agent verified the duplicate transaction, processed an immediate refund, and applied a 10% credit for the inconvenience. Lukas remained dissatisfied with the initial billing error.",
      transcript: makeTranscript("a duplicate charge"),
    },
  },
  {
    id: "c-009",
    caller: { name: "Mei Wong", initials: initialsOf("Mei Wong"), avatarColor: palette[0] },
    company: "Airtable",
    phone: "+1 (510) 555-0181",
    email: "mei.wong@airtable.com",
    duration: "06:15",
    durationSeconds: 375,
    status: "Pickups",
    date: "Apr 24, 2026 · 18:47",
    customFields: {
      satisfaction: "Happy",
      summary: "Integration Help",
      longSummary:
        "Mei needed help connecting Voxa call data to her team's Airtable base via Zapier. Agent shared the official template, validated the webhook, and confirmed data sync within 5 minutes.",
      transcript: makeTranscript("Airtable integration"),
    },
  },
  {
    id: "c-010",
    caller: { name: "Rafael Costa", initials: initialsOf("Rafael Costa"), avatarColor: palette[1] },
    company: "Hubspot",
    phone: "+1 (617) 555-0135",
    email: "rcosta@hubspot.com",
    duration: "08:53",
    durationSeconds: 533,
    status: "Pickups",
    date: "Apr 24, 2026 · 16:09",
    customFields: {
      satisfaction: "Neutral",
      summary: "Technical Review",
      longSummary:
        "Rafael, a solutions engineer, ran through a technical evaluation covering SSO, audit logs, data residency, and webhook reliability. Most boxes checked — flagged EU data residency as a follow-up item.",
      transcript: makeTranscript("technical evaluation"),
    },
  },
];

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

export const customers: CustomerRecord[] = [
  ["Sarah Chen", "Stripe", "sarah.chen@stripe.com", "+1 (415) 555-0142", 14, "Apr 26, 2026", "Active"],
  ["Marcus Johnson", "Linear", "marcus@linear.app", "+1 (628) 555-0119", 8, "Apr 26, 2026", "Active"],
  ["Priya Patel", "Notion", "priya.p@notion.so", "+1 (212) 555-0188", 6, "Apr 26, 2026", "Lead"],
  ["David Kim", "Figma", "dkim@figma.com", "+1 (917) 555-0173", 11, "Apr 25, 2026", "Active"],
  ["Elena Rodriguez", "Vercel", "elena@vercel.com", "+1 (646) 555-0156", 22, "Apr 25, 2026", "Active"],
  ["James O'Brien", "Datadog", "jobrien@datadog.com", "+1 (303) 555-0192", 3, "Apr 25, 2026", "Lead"],
  ["Aisha Thompson", "Shopify", "aisha.t@shopify.com", "+1 (416) 555-0167", 18, "Apr 25, 2026", "Active"],
  ["Lukas Schmidt", "GitLab", "lschmidt@gitlab.com", "+49 30 555 0144", 5, "Apr 25, 2026", "Churned"],
  ["Mei Wong", "Airtable", "mei.wong@airtable.com", "+1 (510) 555-0181", 9, "Apr 24, 2026", "Active"],
  ["Rafael Costa", "Hubspot", "rcosta@hubspot.com", "+1 (617) 555-0135", 4, "Apr 24, 2026", "Lead"],
  ["Hannah Müller", "Spotify", "h.muller@spotify.com", "+46 8 555 0177", 7, "Apr 23, 2026", "Active"],
  ["Tomás Alvarez", "MongoDB", "talvarez@mongodb.com", "+34 91 555 0162", 12, "Apr 23, 2026", "Active"],
].map(([name, company, email, phone, totalCalls, lastContact, status], i) => ({
  id: `cust-${(i + 1).toString().padStart(3, "0")}`,
  name: name as string,
  initials: initialsOf(name as string),
  avatarColor: palette[i % palette.length],
  company: company as string,
  email: email as string,
  phone: phone as string,
  totalCalls: totalCalls as number,
  lastContact: lastContact as string,
  status: status as CustomerRecord["status"],
}));

export const kpis = {
  totalCalls: 1284,
  avgDuration: "04:18",
  missedCalls: 47,
  recallAfm: 132,
  appointments: 86,
  totalCallTime: "92h 14m",
};
