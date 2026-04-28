import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";

export interface CallRow {
  id: string;
  caller_name: string;
  company: string;
  call_duration: number; // seconds
  status: string;
  satisfaction: string;
  two_word_summary: string;
  total_conversation: string;
  detailed_summary: string;
  custom_data: Record<string, any>;
  created_at: string;
}

export interface KpiData {
  totalCalls: number;
  avgDuration: string;
  missedCalls: number;
  totalCallTime: string;
}

const formatDuration = (totalSeconds: number): string => {
  if (!totalSeconds || totalSeconds === 0) return "00:00";
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
};

const formatTotalTime = (totalSeconds: number): string => {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  return `${h}h ${m}m`;
};

const computeKpis = (rows: CallRow[]): KpiData => {
  const totalCalls = rows.length;
  const missedCalls = rows.filter(
    (c) => c.status?.toLowerCase() === "missed"
  ).length;
  const pickedUpCalls = rows.filter((c) => c.call_duration > 0);
  const totalSeconds = rows.reduce((sum, c) => sum + (c.call_duration || 0), 0);
  const avgSeconds =
    pickedUpCalls.length > 0
      ? Math.round(totalSeconds / pickedUpCalls.length)
      : 0;
  return {
    totalCalls,
    avgDuration: formatDuration(avgSeconds),
    missedCalls,
    totalCallTime: formatTotalTime(totalSeconds),
  };
};

export function useDashboardData() {
  const { user } = useAuth();
  const [calls, setCalls] = useState<CallRow[]>([]);
  const [kpis, setKpis] = useState<KpiData>({
    totalCalls: 0,
    avgDuration: "00:00",
    missedCalls: 0,
    totalCallTime: "0h 0m",
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      setLoading(true);
      setError(null);

      // أولاً: نجيب الـ vapi_assistant_id من tenant_settings
      const { data: tenantData } = await supabase
        .from("tenant_settings")
        .select("vapi_assistant_id")
        .eq("id", user.id)
        .single();

      // نحدد الـ tenant_id اللي نبحث فيه
      const tenantId = tenantData?.vapi_assistant_id || user.id;

      // نجيب المكالمات بناءً على الـ tenant_id
      const { data, error: fetchError } = await supabase
        .from("calls")
        .select("*")
        .eq("tenant_id", tenantId)
        .order("created_at", { ascending: false });

      if (fetchError) {
        setError(fetchError.message);
        setLoading(false);
        return;
      }

      const rows = (data as CallRow[]) || [];
      setCalls(rows);
      setKpis(computeKpis(rows));
      setLoading(false);
    };

    fetchData();
  }, [user]);

  return { calls, kpis, loading, error };
}
