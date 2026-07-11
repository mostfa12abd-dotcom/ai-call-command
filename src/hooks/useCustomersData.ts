import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";

export interface CustomerRow {
  id: string;
  name: string;
  phone: string;         // dedicated phone column (from DB)
  email?: string;        // dedicated email column (from DB)
  company: string;
  followup_status?: string;
  call_completed?: boolean;
  created_at: string;
  call_count?: number;
  last_call?: string;
  total_credits?: number;
}

export function useCustomersData() {
  const { user } = useAuth();
  const { language } = useLanguage();
  const dateLocale = language === "ar" ? "ar-EG" : "en-GB";
  const [customers, setCustomers] = useState<CustomerRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;

    const fetchCustomers = async () => {
      setLoading(true);
      setError(null);

      // 1) Fetch customers — now has dedicated phone + email columns
      const { data: custData, error: custErr } = await supabase
        .from("customers")
        .select("id, tenant_id, name, phone, email, contact, company, call_count")
        .eq("tenant_id", user.id);

      if (custErr) {
        setError(custErr.message);
        setLoading(false);
        return;
      }

      // 2) Fetch calls — try user.id, fallback to vapi_assistant_id
      const { data: settingsData } = await supabase
        .from("tenant_settings")
        .select("vapi_assistant_id")
        .eq("id", user.id)
        .single();

      let { data: callsData, error: callsErr } = await supabase
        .from("calls")
        .select("id, caller_name, created_at, company, custom_data, contact, status")
        .eq("tenant_id", user.id)
        .order("created_at", { ascending: false });

      if ((!callsData || callsData.length === 0) && settingsData?.vapi_assistant_id) {
        const fallback = await supabase
          .from("calls")
          .select("id, caller_name, created_at, company, custom_data, contact, status")
          .eq("tenant_id", settingsData.vapi_assistant_id)
          .order("created_at", { ascending: false });
        callsData = fallback.data;
        callsErr = fallback.error;
      }

      if (callsErr) {
        setError(callsErr.message);
        setLoading(false);
        return;
      }

      // ─── Build customer map ───
      // Key priority: normalised phone (most reliable, unique per tenant in DB) → email → name
      const customerMap = new Map<string, CustomerRow>();

      // Seed from the customers table (source of truth — DB enforces uniqueness)
      (custData || []).forEach(c => {
        // phone and email are now dedicated columns; contact is kept for legacy fallback
        const phone = c.phone || (c.contact && !c.contact.includes("@") ? c.contact : "");
        const email = c.email || (c.contact && c.contact.includes("@") ? c.contact : "");

        // Use the DB-enforced unique key: phone (preferred) → email → name
        const key = normalizePhone(phone) || (email || (c.name || c.id).toLowerCase());

        customerMap.set(key, {
          ...c,
          phone: phone || "—",
          email: email || undefined,
          call_count: c.call_count || 0,
          last_call: "—",
          total_credits: 0,
        });
      });

      // Enrich from calls — aggregate credits, last call date, status from latest call
      (callsData || []).forEach(call => {
        // Parse custom_data (may arrive as JSON string or object)
        const cd: Record<string, any> = (() => {
          const raw = call.custom_data;
          if (!raw) return {};
          if (typeof raw === "object") return raw;
          try { return JSON.parse(String(raw).trim()); } catch { return {}; }
        })();

        const callContact = call.contact || cd?.customer?.number || cd?.phone;
        const callPhone  = normalizePhone(callContact && !callContact.includes("@") ? callContact : "");
        const callEmail  = callContact && callContact.includes("@") ? callContact : (cd?.customer_email || cd?.email);
        const name       = call.caller_name || "Unknown";
        const cost       = parseCost(cd?.cost);
        const followup_status = cd?.followup_status || call.status;
        const call_completed  = cd?.call_completed;

        // Match using same priority as DB: phone → email → name
        const key = callPhone || callEmail || name.toLowerCase();
        const existing = customerMap.get(key);

        if (existing) {
          // Aggregate numeric stats
          existing.total_credits = (existing.total_credits || 0) + cost;
          // call_count is already correct from DB (synced by trigger)
          // Fill missing contact info
          if ((!existing.phone || existing.phone === "—") && callPhone) existing.phone = callPhone;
          if (!existing.email && callEmail) existing.email = callEmail;
          // Take most-recent call's status (calls are ordered desc)
          if (followup_status && existing.last_call === "—") {
            existing.followup_status = followup_status;
            existing.call_completed  = call_completed;
            existing.last_call = new Date(call.created_at).toLocaleDateString(dateLocale);
          }
        } else {
          // Customer from calls not yet in customers table (edge case before trigger fires)
          customerMap.set(key, {
            id: call.id,
            name,
            phone: callPhone || "—",
            email: callEmail || undefined,
            company: call.company || "—",
            followup_status: followup_status || undefined,
            call_completed: call_completed,
            created_at: call.created_at,
            call_count: 1,
            last_call: new Date(call.created_at).toLocaleDateString(dateLocale),
            total_credits: cost,
          });
        }
      });

      setCustomers(Array.from(customerMap.values()));
      setLoading(false);
    };

    fetchCustomers();
  }, [user, dateLocale]);

  return { customers, loading, error };
}

// ─── Helpers ────────────────────────────────────────────────────────────────

/** Strip spaces/dashes/parens so "+966 50-123 4567" and "+96650123456" match */
function normalizePhone(phone?: string | null): string {
  if (!phone) return "";
  return phone.replace(/[\s\-().]/g, "");
}

function parseCost(cost: any): number {
  if (typeof cost === "number") return cost;
  if (typeof cost === "string") return parseFloat(cost) || 0;
  return 0;
}
