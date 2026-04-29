import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";

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
  const [customers, setCustomers] = useState<CustomerRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;

    const fetchCustomers = async () => {
      setLoading(true);
      setError(null);

      // Fetch customers
      const { data: custData, error: custErr } = await supabase
        .from("customers")
        .select("*")
        .eq("tenant_id", user.id)
        .order("created_at", { ascending: false });

      if (custErr) {
        setError(custErr.message);
        setLoading(false);
        return;
      }

      // For each customer, count their calls by matching name
      const { data: callsData } = await supabase
        .from("calls")
        .select("caller_name, created_at")
        .eq("tenant_id", user.id);

      const enriched = (custData || []).map((c) => {
        const customerCalls = (callsData || []).filter(
          (call) => call.caller_name?.toLowerCase() === c.name?.toLowerCase()
        );
        const derivedCount = customerCalls.length;
        const derivedLast =
          customerCalls.length > 0
            ? new Date(
                Math.max(
                  ...customerCalls.map((x) => new Date(x.created_at).getTime())
                )
              ).toLocaleDateString()
            : null;
        return {
          ...c,
          call_count: c.total_calls ?? derivedCount,
          last_call: c.last_contact ?? derivedLast ?? "—",
        };
      });

      setCustomers(enriched);
      setLoading(false);
    };

    fetchCustomers();
  }, [user]);

  return { customers, loading, error };
}
