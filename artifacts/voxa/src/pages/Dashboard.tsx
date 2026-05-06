import React, { useState } from "react";
import {
  Phone,
  Clock,
  PhoneMissed,
  Timer,
  Filter,
  Download,
  Search,
  Loader2,
  DollarSign,
} from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { KpiCard } from "@/components/dashboard/KpiCard";
import { CallDetailDrawer } from "@/components/dashboard/CallDetailDrawer";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useDashboardData, resolveDataPath, type CallRow, type TenantCustomAction } from "@/hooks/useDashboardData";
import { useLanguage } from "@/contexts/LanguageContext";
import { cn } from "@/lib/utils";

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
  (name || "?")
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

const satisfactionMeta: Record<string, { emoji: string; tone: string }> = {
  High: { emoji: "😊", tone: "text-success" },
  Medium: { emoji: "😐", tone: "text-warning" },
  Low: { emoji: "😠", tone: "text-destructive" },
  None: { emoji: "—", tone: "text-muted-foreground" },
};

const Dashboard = () => {
  const { calls, kpis, loading, error, columns, customActions, featureFlags } = useDashboardData();
  const { t, language } = useLanguage();
  const [selected, setSelected] = useState<any | null>(null);
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const dateLocale = language === "ar" ? "ar-EG" : "en-GB";

  const handleRowClick = (call: CallRow) => {
    // Map Supabase row to the shape CallDetailDrawer expects
    const mapped = {
      id: call.id,
      caller: {
        name: call.caller_name || "Unknown",
        initials: initialsOf(call.caller_name || "Unknown"),
        avatarColor: palette[0],
      },
      company: call.company || "—",
      phone: call.customer_number || call.custom_data?.phone || "—",
      email: call.custom_data?.email || "—",
      duration: call.call_duration
        ? `${Math.floor(call.call_duration / 60)
            .toString()
            .padStart(2, "0")}:${(call.call_duration % 60)
            .toString()
            .padStart(2, "0")}`
        : "00:00",
      durationSeconds: call.call_duration || 0,
      status: call.status === "Pickup" ? "Pickups" : call.status,
      date: new Date(call.created_at).toLocaleString(dateLocale, {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      }),
      customFields: {
        satisfaction: call.satisfaction || "None",
        summary: call.two_word_summary || "—",
        longSummary: call.detailed_summary || "No summary available.",
        totalConversation: call.total_conversation || "",
        transcript: [],
      },
      recordingUrl: call.recording_url,
      rawCall: call, // إرسال المكالمة الخام لكي يستخدمها الـ Drawer
      uiColumns: columns
    };
    setSelected(mapped);
    setOpen(true);
  };

  const filtered = calls.filter(
    (c) =>
      (statusFilter === "all" || c.status === statusFilter) &&
      (c.caller_name?.toLowerCase().includes(search.toLowerCase()) ||
       c.company?.toLowerCase().includes(search.toLowerCase()))
  );

  // Group calls by date (day/month/year), language-aware
  const formatDateLabel = (dateStr: string) => {
    const d = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    const sameDay = (a: Date, b: Date) =>
      a.getFullYear() === b.getFullYear() &&
      a.getMonth() === b.getMonth() &&
      a.getDate() === b.getDate();

    if (sameDay(d, today)) return t("common.today");
    if (sameDay(d, yesterday)) return t("common.yesterday");
    return d.toLocaleDateString(dateLocale, {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const formatTimeOfDay = (dateStr: string) => {
    const d = new Date(dateStr);
    let h = d.getHours();
    const m = d.getMinutes().toString().padStart(2, "0");
    const period = h >= 12 ? t("common.pm") : t("common.am");
    h = h % 12;
    if (h === 0) h = 12;
    return `${h}:${m} ${period}`;
  };

  const grouped: { dateKey: string; label: string; items: CallRow[] }[] = [];
  filtered.forEach((c) => {
    const d = new Date(c.created_at);
    const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
    let group = grouped.find((g) => g.dateKey === key);
    if (!group) {
      group = { dateKey: key, label: formatDateLabel(c.created_at), items: [] };
      grouped.push(group);
    }
    group.items.push(c);
  });

  const isRtl = language === "ar";

  return (
    <DashboardLayout
      title={t("dashboard.crumb.center")}
      breadcrumb={[t("dashboard.crumb.overview")]}
    >
      {/* KPI Grid */}
      <section className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-5 md:gap-4">
        <KpiCard
          label={t("dashboard.kpi.totalCalls")}
          value={loading ? "..." : kpis.totalCalls.toLocaleString(dateLocale)}
          icon={Phone}
          tone="primary"
          trend={{ value: "", positive: true }}
        />
        <KpiCard
          label={t("dashboard.kpi.avgDuration")}
          value={loading ? "..." : kpis.avgDuration}
          icon={Clock}
          tone="primary"
          trend={{ value: "", positive: true }}
        />
        <KpiCard
          label={t("dashboard.kpi.missed")}
          value={loading ? "..." : kpis.missedCalls.toLocaleString(dateLocale)}
          icon={PhoneMissed}
          tone="destructive"
          trend={{ value: "", positive: false }}
        />
        <KpiCard
          label={t("dashboard.kpi.totalTime")}
          value={loading ? "..." : kpis.totalCallTime.replace("h", isRtl ? "س" : "h").replace("m", isRtl ? "د" : "m")}
          icon={Timer}
          tone="primary"
          trend={{ value: "", positive: true }}
        />
        <KpiCard
          label={t("dashboard.kpi.totalCredits")}
          value={loading ? "..." : (isRtl ? `${kpis.totalCredits} $` : `$${kpis.totalCredits}`)}
          icon={DollarSign}
          tone="primary"
          trend={{ value: "", positive: true }}
        />
      </section>

      {/* Recent Calls Table */}
      <section className="mt-6 overflow-hidden rounded-2xl border border-border/70 bg-card shadow-card">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 px-5 py-4">
          <div>
            <h2 className="text-base font-semibold tracking-tight text-foreground">
              {t("dashboard.callsTitle")}
            </h2>
            <p className="text-xs text-muted-foreground">
              {t("dashboard.callsSubtitle")}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative hidden sm:block">
              <Search className={cn("pointer-events-none absolute top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground", isRtl ? "right-3" : "left-3")} />
              <Input
                placeholder={t("dashboard.searchPlaceholder")}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className={cn("h-9 w-52 rounded-lg border-border bg-secondary/60 text-sm shadow-none", isRtl ? "pr-9" : "pl-9")}
              />
            </div>
            <Button 
              variant={statusFilter === "all" ? "outline" : "default"} 
              size="sm" 
              className="h-9 gap-1.5"
              onClick={() => {
                const statuses = ["all", "Pickup", "Missed"];
                const next = statuses[(statuses.indexOf(statusFilter) + 1) % statuses.length];
                setStatusFilter(next);
              }}
            >
              <Filter className="h-3.5 w-3.5" /> {statusFilter === "all" ? t("common.filter") : statusFilter}
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20 text-muted-foreground">
            <Loader2 className={cn("h-5 w-5 animate-spin", isRtl ? "ml-2" : "mr-2")} />
            {t("dashboard.loading")}
          </div>
        ) : error ? (
          <div className="py-10 text-center text-sm text-destructive">{error}</div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center text-sm text-muted-foreground">
            {t("dashboard.empty")}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-border/60 bg-secondary/40 hover:bg-secondary/40">
                  <TableHead className="w-28 text-[11px] font-semibold uppercase tracking-wider text-start">{t("dashboard.col.time")}</TableHead>
                  {columns.map((col) => {
                    const colLabelKey = `col.${col.label.toLowerCase()}` as any;
                    const colLabel = t(colLabelKey) !== colLabelKey ? t(colLabelKey) : col.label;
                    return (
                      <TableHead key={col.column_key} className="text-[11px] font-semibold uppercase tracking-wider text-start">
                        {colLabel}
                      </TableHead>
                    );
                  })}
                </TableRow>
              </TableHeader>
              <TableBody>
                {grouped.map((group, gIdx) => (
                  <React.Fragment key={group.dateKey}>
                    <tr className="bg-background hover:bg-background">
                      <td colSpan={7} className="border-0 p-0">
                        <div
                          className={cn(
                            "flex items-center justify-center px-5",
                            gIdx === 0 ? "pb-3 pt-4" : "pb-3 pt-6"
                          )}
                        >
                          <span className="rounded-full bg-card px-3 py-1 text-xs font-semibold text-foreground shadow-sm ring-1 ring-border/60">
                            {group.label}
                          </span>
                        </div>
                      </td>
                    </tr>

                    {group.items.map((call, i) => {
                      const sat = satisfactionMeta[call.satisfaction] || satisfactionMeta["None"];
                      const isPickup = call.status?.toLowerCase() === "pickup";
                      const durationStr = call.call_duration
                        ? `${Math.floor(call.call_duration / 60).toString().padStart(2, "0")}:${(call.call_duration % 60).toString().padStart(2, "0")}`
                        : "00:00";

                      return (
                        <TableRow
                          key={call.id}
                          onClick={() => handleRowClick(call)}
                          className="cursor-pointer border-border/60 bg-card transition-colors hover:bg-[hsl(var(--primary-soft))]/40"
                        >
                          <TableCell>
                            <span className="font-mono text-xs font-medium tabular-nums text-muted-foreground">
                              {formatTimeOfDay(call.created_at)}
                            </span>
                          </TableCell>
                          
                          {columns.map((col) => {
                            const value = resolveDataPath(call, col.data_path);
                            
                            if (col.column_key === "caller_name") {
                              return (
                                <TableCell key={col.column_key}>
                                  <div className="flex items-center gap-3">
                                    <Avatar className="h-9 w-9">
                                      <AvatarFallback className={cn("text-xs font-semibold", palette[i % palette.length])}>
                                        {initialsOf(value)}
                                      </AvatarFallback>
                                    </Avatar>
                                    <div className="min-w-0">
                                      <p className="truncate text-sm font-semibold text-foreground">
                                        {value}
                                      </p>
                                      <div className="flex flex-col text-[10px] leading-tight text-muted-foreground">
                                        <span>{call.customer_number || call.custom_data?.phone || "—"}</span>
                                        <span>{call.custom_data?.customer?.email || call.custom_data?.email || "—"}</span>
                                      </div>
                                    </div>
                                  </div>
                                </TableCell>
                              );
                            }

                            if (col.column_key === "status") {
                              const isPickup = value.toLowerCase() === "pickup" || value.toLowerCase() === "pickups";
                              return (
                                <TableCell key={col.column_key}>
                                  <Badge
                                    className={cn(
                                      "rounded-full border-transparent px-2.5 py-0.5 text-[11px] font-semibold",
                                      isPickup
                                        ? "bg-success-soft text-success hover:bg-success-soft"
                                        : "bg-[hsl(var(--destructive-soft))] text-destructive hover:bg-[hsl(var(--destructive-soft))]"
                                    )}
                                  >
                                    <span className={cn("mr-1.5 inline-block h-1.5 w-1.5 rounded-full", isPickup ? "bg-success" : "bg-destructive")} />
                                    {value}
                                  </Badge>
                                </TableCell>
                              );
                            }

                            if (col.column_key === "satisfaction") {
                              const satInfo = satisfactionMeta[value] || satisfactionMeta["None"];
                              const transKey = `satisfaction.${value.toLowerCase()}` as any;
                              const translatedValue = t(transKey) !== transKey ? t(transKey) : value;
                              return (
                                <TableCell key={col.column_key}>
                                  <span className={cn("inline-flex items-center gap-1.5 text-sm font-medium", satInfo.tone)}>
                                    <span className="text-base leading-none">{satInfo.emoji}</span>
                                    {translatedValue}
                                  </span>
                                </TableCell>
                              );
                            }

                            if (col.column_key === "two_word_summary") {
                              return (
                                <TableCell key={col.column_key}>
                                  <Badge variant="outline" className="rounded-md border-border bg-secondary/60 font-medium text-foreground">
                                    {value}
                                  </Badge>
                                </TableCell>
                              );
                            }

                            return (
                              <TableCell key={col.column_key}>
                                <span className={col.column_key === "call_duration" ? "font-mono text-sm tabular-nums text-foreground" : "text-sm text-foreground"}>
                                  {value}
                                </span>
                              </TableCell>
                            );
                          })}
                        </TableRow>
                      );
                    })}
                  </React.Fragment>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </section>

      <CallDetailDrawer call={selected} open={open} onOpenChange={setOpen} customActions={customActions} />
    </DashboardLayout>
  );
};

export default Dashboard;
