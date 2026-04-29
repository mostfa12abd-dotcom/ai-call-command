import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";

export interface CustomerRow {
  id: string;
  name: string;
  phone: string;
  company: string;
  created_at: string;
  call_count?: number;
  last_call?: string;
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

      // 1) Fetch known customers
      const { data: custData } = await supabase
        .from("customers")
        .select("*")
        .eq("tenant_id", user.id);

      // 2) Get unique customers from calls
      const { data: callsData, error: callsErr } = await supabase
        .from("calls")
        .select("caller_name, created_at, company, custom_data")
        .eq("tenant_id", user.id)
        .order("created_at", { ascending: false });

      if (callsErr) {
        setError(callsErr.message);
        setLoading(false);
        return;
      }

      const customerMap = new Map<string, CustomerRow>();

      // First add known customers from the customers table
      (custData || []).forEach(c => {
        customerMap.set(c.name.toLowerCase(), {
          ...c,
          call_count: 0,
          last_call: "—"
        });
      });

      // Then enrich/add from calls
      (callsData || []).forEach(call => {
        const name = call.caller_name || "Unknown";
        const key = name.toLowerCase();
        
        if (customerMap.has(key)) {
          const existing = customerMap.get(key)!;
          existing.call_count = (existing.call_count || 0) + 1;
          if (existing.last_call === "—") {
            existing.last_call = new Date(call.created_at).toLocaleDateString(dateLocale);
          }
        } else {
          customerMap.set(key, {
            id: call.id, // Using call ID as a temporary customer ID if not in customers table
            name: name,
            phone: call.custom_data?.customer?.number || call.custom_data?.phone || "—",
            company: call.company || "—",
            created_at: call.created_at,
            call_count: 1,
            last_call: new Date(call.created_at).toLocaleDateString(dateLocale)
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
