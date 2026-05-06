import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";

export interface CallRow {
  id: string;
  vapi_id?: string;
  caller_name: string;
  customer_number?: string;
  ended_reason?: string;
  company: string;
  call_duration: number;
  status: string;
  satisfaction: string;
  two_word_summary: string;
  total_conversation: string;
  detailed_summary: string;
  custom_data: Record<string, any>;
  recording_url?: string;
  created_at: string;
}

export interface TenantColumn {
  column_key: string;
  label: string;
  data_path: string;
  visible: boolean;
  position: number;
}

export interface TenantCustomAction {
  action_id: string;
  label: string;
  webhook_url: string;
  page_location: string;
  icon?: string;
  color_class?: string;
}

export interface KpiData {
  totalCalls: number;
  avgDuration: string;
  missedCalls: number;
  totalCallTime: string;
  totalCredits: string;
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

// Parse custom_data whether it comes as string or object
function parseCustomData(raw: any): Record<string, any> {
  if (!raw) return {};
  if (typeof raw === "object") return raw;
  if (typeof raw === "string") {
    try { return JSON.parse(raw.trim()); } catch { return {}; }
  }
  return {};
}

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
  const totalCreditsNum = rows.reduce((sum, c) => {
    const cd = parseCustomData(c.custom_data);
    const cost = cd?.cost;
    return sum + (typeof cost === "number" ? cost : parseFloat(cost) || 0);
  }, 0);
  return {
    totalCalls,
    avgDuration: formatDuration(avgSeconds),
    missedCalls,
    totalCallTime: formatTotalTime(totalSeconds),
    totalCredits: `$${totalCreditsNum.toFixed(3)}`,
  };
};

// دالة لاستخراج قيمة من مسار مثل "custom_data.appointment"
export function resolveDataPath(row: CallRow, path: string): string {
  const parts = path.split(".");
  let value: any = row;
  for (const part of parts) {
    if (value == null) return "—";
    // Parse string JSON at any level (custom_data stored as string)
    if (typeof value === "string") {
      try { value = JSON.parse(value.trim()); } catch(e) {}
    }
    value = value[part];
  }
  if (value == null || value === "") return "—";
  // Boolean: return true/false string so caller can detect it
  if (typeof value === "boolean") return String(value);
  if (typeof value === "number" && path === "call_duration") {
    const m = Math.floor(value / 60).toString().padStart(2, "0");
    const s = (value % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  }
  if (typeof value === "number" && path.includes("cost")) {
    return `$${value.toFixed(3)}`;
  }
  return String(value);
}

// الأعمدة الافتراضية إذا لم يكن للعميل إعدادات خاصة
const DEFAULT_COLUMNS: TenantColumn[] = [
  { column_key: "caller_name",      label: "Name",          data_path: "caller_name",      visible: true, position: 1 },
  { column_key: "call_duration",    label: "Duration",      data_path: "call_duration",    visible: true, position: 2 },
  { column_key: "credits",          label: "Credits",       data_path: "custom_data.cost", visible: true, position: 3 },
  { column_key: "status",           label: "Status",        data_path: "status",           visible: true, position: 4 },
  { column_key: "followup_status",  label: "Follow-up",     data_path: "custom_data.followup_status", visible: true, position: 5 },
  { column_key: "call_completed",   label: "Completion",     data_path: "custom_data.call_completed",  visible: true, position: 6 },
  { column_key: "two_word_summary", label: "Summary",       data_path: "two_word_summary", visible: true, position: 7 },
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
  const [featureFlags, setFeatureFlags] = useState<Record<string, any>>({});
  const [customActions, setCustomActions] = useState<TenantCustomAction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      setLoading(true);
      setError(null);

      // 1) جيب إعدادات العميل (assistant_id + أعمدة مخصصة + ميزات)
      const { data: tenantData } = await supabase
        .from("tenant_settings")
        .select("vapi_assistant_id, feature_flags")
        .eq("id", user.id)
        .single();
        
      if (tenantData?.feature_flags) {
        setFeatureFlags(tenantData.feature_flags);
      }

      const { data: colData } = await supabase
        .from("tenant_columns")
        .select("column_key, label, data_path, visible, position")
        .eq("tenant_id", user.id)
        .eq("visible", true)
        .order("position");

      if (colData && colData.length > 0) {
        setColumns(colData as TenantColumn[]);
      }

      const { data: actionsData } = await supabase
        .from("tenant_custom_actions")
        .select("*")
        .eq("tenant_id", user.id);

      if (actionsData && actionsData.length > 0) {
        setCustomActions(actionsData as TenantCustomAction[]);
      }

      // 2) جيب المكالمات
      let { data, error: fetchError } = await supabase
        .from("calls")
        .select("*")
        .eq("tenant_id", user.id)
        .order("created_at", { ascending: false });

      if ((!data || data.length === 0) && tenantData?.vapi_assistant_id) {
        const fallback = await supabase
          .from("calls")
          .select("*")
          .eq("tenant_id", tenantData.vapi_assistant_id)
          .order("created_at", { ascending: false });
        data = fallback.data;
        fetchError = fallback.error;
      }

      if (fetchError) {
        setError(fetchError.message);
        setLoading(false);
        return;
      }

      const rows = (data as CallRow[]) || [];
      setCalls(rows);
      
      const computed = computeKpis(rows);
      // Return raw values for duration/credits to let UI localize them
      setKpis({
        ...computed,
        totalCredits: computed.totalCredits.replace("$", "") // Remove $ if any, UI will format
      });
      setLoading(false);
    };

    fetchData();
  }, [user]);

  return { calls, kpis, columns, featureFlags, customActions, loading, error };
}
