// Local mock backend that mirrors the Supabase client surface used by this app.
// The original Lovable app called supabase.from(...).select().eq()... etc.
// We replace it with an in-memory store backed by mockData.ts so the UI keeps
// working visually and functionally without any external service.

import {
  calls as mockCalls,
  customers as mockCustomers,
  type CallRecord,
} from "@/data/mockData";

type Row = Record<string, any>;

// ---------- Build an in-memory dataset shaped like the original tables ----------

const DEFAULT_TENANT_ID = "demo-tenant";

// Mock dates use a format like "Apr 26, 2026 · 09:14" which Date can't parse natively.
function parseMockDate(s: string): string {
  const cleaned = s.replace(" · ", " ");
  const d = new Date(cleaned);
  if (Number.isNaN(d.getTime())) return new Date().toISOString();
  return d.toISOString();
}

const callsTable: Row[] = mockCalls.map((c: CallRecord) => ({
  id: c.id,
  tenant_id: DEFAULT_TENANT_ID,
  caller_name: c.caller.name,
  company: c.company,
  call_duration: c.durationSeconds,
  status: c.status === "Pickups" ? "pickup" : "missed",
  satisfaction:
    c.customFields.satisfaction === "Happy"
      ? "High"
      : c.customFields.satisfaction === "Neutral"
        ? "Medium"
        : "Low",
  two_word_summary: c.customFields.summary,
  total_conversation: c.customFields.transcript
    .map((t) => `${t.speaker} (${t.time}): ${t.text}`)
    .join("\n"),
  detailed_summary: c.customFields.longSummary,
  custom_data: { phone: c.phone, email: c.email },
  recording_url: undefined,
  created_at: parseMockDate(c.date),
}));

// Use the rich mock customer roster (with realistic call counts and last contact)
// rather than deriving it from the small calls list.
const customersTable: Row[] = mockCustomers.map((c) => ({
  id: c.id,
  tenant_id: DEFAULT_TENANT_ID,
  name: c.name,
  phone: c.phone,
  email: c.email,
  company: c.company,
  total_calls: c.totalCalls,
  last_contact: c.lastContact,
  status: c.status,
  created_at: parseMockDate(`${c.lastContact} · 09:00`),
}));

const tenantSettingsTable: Row[] = [
  {
    id: DEFAULT_TENANT_ID,
    vapi_assistant_id: DEFAULT_TENANT_ID,
    feature_flags: { recordings: true, custom_actions: true },
  },
];

const tenantColumnsTable: Row[] = []; // empty → fall back to defaults
const tenantCustomActionsTable: Row[] = []; // empty by default

const tables: Record<string, Row[]> = {
  calls: callsTable,
  customers: customersTable,
  tenant_settings: tenantSettingsTable,
  tenant_columns: tenantColumnsTable,
  tenant_custom_actions: tenantCustomActionsTable,
};

// ---------- Auth (local) ----------

const AUTH_KEY = "voxa-mock-session";

type MockUser = {
  id: string;
  email: string;
};

type MockSession = {
  user: MockUser;
  access_token: string;
};

type AuthListener = (event: string, session: MockSession | null) => void;
const authListeners = new Set<AuthListener>();

function readSession(): MockSession | null {
  try {
    const raw = localStorage.getItem(AUTH_KEY);
    return raw ? (JSON.parse(raw) as MockSession) : null;
  } catch {
    return null;
  }
}

function writeSession(session: MockSession | null) {
  if (typeof window === "undefined") return;
  if (session) localStorage.setItem(AUTH_KEY, JSON.stringify(session));
  else localStorage.removeItem(AUTH_KEY);
  authListeners.forEach((fn) => fn(session ? "SIGNED_IN" : "SIGNED_OUT", session));
}

function makeSession(email: string): MockSession {
  return {
    user: { id: DEFAULT_TENANT_ID, email },
    access_token: `mock-${Date.now()}`,
  };
}

// ---------- Query builder mirroring supabase-js ----------

class QueryBuilder {
  private rows: Row[];
  private filters: Array<(r: Row) => boolean> = [];
  private orderField: string | null = null;
  private orderAsc = true;
  private singleMode = false;

  constructor(table: string) {
    this.rows = (tables[table] ?? []).slice();
  }

  // select() is a no-op for projections; we return all columns.
  select(_cols?: string) {
    return this;
  }

  eq(column: string, value: any) {
    this.filters.push((r) => r[column] === value);
    return this;
  }

  ilike(column: string, value: string) {
    const needle = String(value).toLowerCase();
    this.filters.push((r) => String(r[column] ?? "").toLowerCase() === needle);
    return this;
  }

  order(column: string, opts?: { ascending?: boolean }) {
    this.orderField = column;
    this.orderAsc = opts?.ascending !== false;
    return this;
  }

  single() {
    this.singleMode = true;
    return this.execute();
  }

  private execute(): Promise<{ data: any; error: any }> {
    let result = this.rows;
    for (const f of this.filters) result = result.filter(f);
    if (this.orderField) {
      const k = this.orderField;
      const dir = this.orderAsc ? 1 : -1;
      result = result.slice().sort((a, b) => {
        const av = a[k];
        const bv = b[k];
        if (av === bv) return 0;
        return av > bv ? dir : -dir;
      });
    }
    if (this.singleMode) {
      return Promise.resolve({ data: result[0] ?? null, error: null });
    }
    return Promise.resolve({ data: result, error: null });
  }

  // Allow `await` on the builder directly.
  then<T>(
    onFulfilled?: (value: { data: any; error: any }) => T,
    onRejected?: (reason: any) => any,
  ) {
    return this.execute().then(onFulfilled, onRejected);
  }
}

export const supabase = {
  from(table: string) {
    return new QueryBuilder(table);
  },
  auth: {
    async getSession(): Promise<{ data: { session: MockSession | null } }> {
      return { data: { session: readSession() } };
    },
    onAuthStateChange(cb: AuthListener) {
      authListeners.add(cb);
      return {
        data: {
          subscription: {
            unsubscribe: () => authListeners.delete(cb),
          },
        },
      };
    },
    async signInWithPassword({ email }: { email: string; password: string }) {
      if (!email) {
        return { data: { user: null, session: null }, error: { message: "Email required" } };
      }
      const session = makeSession(email);
      writeSession(session);
      return { data: { user: session.user, session }, error: null };
    },
    async signUp({ email }: { email: string; password: string }) {
      if (!email) {
        return { data: { user: null, session: null }, error: { message: "Email required" } };
      }
      const session = makeSession(email);
      writeSession(session);
      return { data: { user: session.user, session }, error: null };
    },
    async signOut() {
      writeSession(null);
      return { error: null };
    },
  },
};
