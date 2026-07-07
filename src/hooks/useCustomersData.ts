import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";

export interface CustomerRow {
  id: string;
  name: string;
  phone: string;
  company: string;
  email?: string;
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

      // 1) Fetch known customers from customers table (has email, followup_status, call_completed)
      const { data: custData } = await supabase
        .from("customers")
        .select("*")
        .eq("tenant_id", user.id);

      // 2) Fetch all calls — try user.id, fallback to vapi_assistant_id
      const { data: settingsData } = await supabase
        .from("tenant_settings")
        .select("vapi_assistant_id")
        .eq("id", user.id)
        .single();

      let { data: callsData, error: callsErr } = await supabase
        .from("calls")
        .select("id, caller_name, created_at, company, custom_data, customer_number")
        .eq("tenant_id", user.id)
        .order("created_at", { ascending: false });

      if ((!callsData || callsData.length === 0) && settingsData?.vapi_assistant_id) {
        const fallback = await supabase
          .from("calls")
          .select("id, caller_name, created_at, company, custom_data, customer_number")
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

      // Build customer map — key by phone number (primary) or name (fallback)
      const customerMap = new Map<string, CustomerRow>();

      // Seed from the customers table first (has email/status data)
      (custData || []).forEach(c => {
        const key = normalizePhone(c.phone) || (c.name || c.id).toLowerCase();
        customerMap.set(key, {
          ...c,
          call_count: 0,
          last_call: "—",
          total_credits: 0,
        });
      });

      // Enrich from calls — match by phone number first, then by name
      (callsData || []).forEach(call => {
        // custom_data may come as a JSON string from Supabase — parse it first
        const cd: Record<string, any> = (() => {
          const raw = call.custom_data;
          if (!raw) return {};
          if (typeof raw === "object") return raw;
          try { return JSON.parse(String(raw).trim()); } catch { return {}; }
        })();

        const phone = normalizePhone(call.customer_number || cd?.customer?.number || cd?.phone);
        const name = call.caller_name || "Unknown";
        const cost = parseCost(cd?.cost);
        const email = cd?.customer_email || cd?.email;
        const followup_status = cd?.followup_status || call.status;
        const call_completed = cd?.call_completed;

        // Try phone key first, then name key
        const key = phone || name.toLowerCase();
        const existing = customerMap.get(key);

        if (existing) {
          existing.call_count = (existing.call_count || 0) + 1;
          existing.total_credits = (existing.total_credits || 0) + cost;
          if (!existing.phone && phone) existing.phone = phone;
          if (!existing.email && email) existing.email = email;
          
          // Always take the most recent call's status and completion
          if (followup_status) existing.followup_status = followup_status;
          if (call_completed !== undefined) existing.call_completed = call_completed;

          if (existing.last_call === "—") {
            existing.last_call = new Date(call.created_at).toLocaleDateString(dateLocale);
          }
        } else {
          customerMap.set(key, {
            id: call.id,
            name,
            phone: phone || "—",
            company: call.company || "—",
            email: email || undefined,
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

// Normalize phone: remove spaces, dashes, keep only digits and leading +
function normalizePhone(phone?: string | null): string {
  if (!phone) return "";
  const cleaned = phone.replace(/[\s\-().]/g, "");
  return cleaned || "";
}

function parseCost(cost: any): number {
  if (typeof cost === "number") return cost;
  if (typeof cost === "string") return parseFloat(cost) || 0;
  return 0;
}
