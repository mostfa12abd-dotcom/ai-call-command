import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";

export interface CallRow {
  id: string;
  caller_name: string;
  company: string;
  call_duration: number;
  status: string;
  satisfaction: string;
  two_word_summary: string;
  total_conversation: string;
  detailed_summary: string;
  custom_data: Record<string, any>;
  created_at: string;
}

export interface TenantColumn {
  column_key: string;
  label: string;
  data_path: string;
  visible: boolean;
  position: number;
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

// دالة لاستخراج قيمة من مسار مثل "custom_data.appointment"
export function resolveDataPath(row: CallRow, path: string): string {
  const parts = path.split(".");
  let value: any = row;
  for (const part of parts) {
    if (value == null) return "—";
    value = value[part];
  }
  if (value == null || value === "") return "—";
  if (typeof value === "number" && path === "call_duration") {
    const m = Math.floor(value / 60).toString().padStart(2, "0");
    const s = (value % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  }
  return String(value);
}

// الأعمدة الافتراضية إذا لم يكن للعميل إعدادات خاصة
const DEFAULT_COLUMNS: TenantColumn[] = [
  { column_key: "caller_name",      label: "Caller",       data_path: "caller_name",      visible: true, position: 1 },
  { column_key: "call_duration",    label: "Duration",     data_path: "call_duration",    visible: true, position: 2 },
  { column_key: "status",           label: "Status",       data_path: "status",           visible: true, position: 3 },
  { column_key: "satisfaction",     label: "Satisfaction", data_path: "satisfaction",     visible: true, position: 4 },
  { column_key: "two_word_summary", label: "Summary",      data_path: "two_word_summary", visible: true, position: 5 },
];

export function useDashboardData() {
  const { user } = useAuth();
  const [calls, setCalls] = useState<CallRow[]>([]);
  const [kpis, setKpis] = useState<KpiData>({
    totalCalls: 0,
    avgDuration: "00:00",
    missedCalls: 0,
    totalCallTime: "0h 0m",
  });
  const [columns, setColumns] = useState<TenantColumn[]>(DEFAULT_COLUMNS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      setLoading(true);
      setError(null);

      // 1) جيب إعدادات العميل (assistant_id + أعمدة مخصصة)
      const { data: tenantData } = await supabase
        .from("tenant_settings")
        .select("vapi_assistant_id")
        .eq("id", user.id)
        .single();

      const { data: colData } = await supabase
        .from("tenant_columns")
        .select("column_key, label, data_path, visible, position")
        .eq("tenant_id", user.id)
        .eq("visible", true)
        .order("position");

      if (colData && colData.length > 0) {
        setColumns(colData as TenantColumn[]);
      }

      // 2) جيب المكالمات
      const tenantId = tenantData?.vapi_assistant_id || user.id;
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

  return { calls, kpis, columns, loading, error };
}
