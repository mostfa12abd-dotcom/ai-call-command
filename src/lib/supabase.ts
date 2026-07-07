import { createClient } from "@supabase/supabase-js";

const rawUrl = (import.meta.env.VITE_SUPABASE_URL as string | undefined) ?? "";
const rawKey = (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined) ?? "";

// Strip any non-printable-ASCII characters (>255 or <32 except tab) that would
// break HTTP header construction in the browser Fetch API.
function sanitize(value: string): string {
  return value.replace(/[^\x20-\x7E]/g, "").trim();
}

let url = sanitize(rawUrl);
const anonKey = sanitize(rawKey);

if (!url || !anonKey) {
  throw new Error(
    "Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY."
  );
}

// Normalize URL: ensure https:// prefix and .supabase.co suffix for bare project refs
if (!url.startsWith("http://") && !url.startsWith("https://")) {
  url = "https://" + url;
}
if (!url.includes(".")) {
  url = "https://" + url.replace("https://", "") + ".supabase.co";
}

export const supabase = createClient(url, anonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    // Disabled: auto-processing triggers _getUser which fails in this env.
    // AuthCallback.tsx handles the OAuth tokens manually via refreshSession().
    detectSessionInUrl: false,
    flowType: "implicit",
  },
});
