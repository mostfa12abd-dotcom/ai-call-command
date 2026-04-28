import { useState } from "react";
import {
  Phone,
  Clock,
  PhoneMissed,
  Timer,
  Filter,
  Download,
  Search,
  Loader2,
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
import { useDashboardData, type CallRow } from "@/hooks/useDashboardData";
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
  const { calls, kpis, loading, error } = useDashboardData();
  const [selected, setSelected] = useState<any | null>(null);
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

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
      phone: call.custom_data?.phone || "—",
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
      date: new Date(call.created_at).toLocaleString(),
      customFields: {
        satisfaction: call.satisfaction || "None",
        summary: call.two_word_summary || "—",
        longSummary: call.detailed_summary || "No summary available.",
        totalConversation: call.total_conversation || "",
        transcript: [],
      },
    };
    setSelected(mapped);
    setOpen(true);
  };

  const filtered = calls.filter(
    (c) =>
      c.caller_name?.toLowerCase().includes(search.toLowerCase()) ||
      c.company?.toLowerCase().includes(search.toLowerCase())
  );

  // تجميع المكالمات حسب التاريخ (يوم/شهر/سنة)
  const formatDateLabel = (dateStr: string) => {
    const d = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    const sameDay = (a: Date, b: Date) =>
      a.getFullYear() === b.getFullYear() &&
      a.getMonth() === b.getMonth() &&
      a.getDate() === b.getDate();

    if (sameDay(d, today)) return "اليوم";
    if (sameDay(d, yesterday)) return "أمس";
    return d.toLocaleDateString("ar-EG", {
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
    const period = h >= 12 ? "مساءً" : "صباحًا";
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

  return (
    <DashboardLayout
      title="AI Voice Call Center"
      breadcrumb={["Dashboard", "AI Voice Call Center", "Overview"]}
    >
      {/* KPI Grid */}
      <section className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
        <KpiCard
          label="Total Calls"
          value={loading ? "..." : kpis.totalCalls.toLocaleString()}
          icon={Phone}
          tone="primary"
          trend={{ value: "", positive: true }}
        />
        <KpiCard
          label="Avg Call Duration"
          value={loading ? "..." : kpis.avgDuration}
          icon={Clock}
          tone="primary"
          trend={{ value: "", positive: true }}
        />
        <KpiCard
          label="Missed Calls"
          value={loading ? "..." : String(kpis.missedCalls)}
          icon={PhoneMissed}
          tone="destructive"
          trend={{ value: "", positive: false }}
        />
        <KpiCard
          label="Total Call Time"
          value={loading ? "..." : kpis.totalCallTime}
          icon={Timer}
          tone="primary"
          trend={{ value: "", positive: true }}
        />
      </section>

      {/* Recent Calls Table */}
      <section className="mt-6 overflow-hidden rounded-2xl border border-border/70 bg-card shadow-card">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 px-5 py-4">
          <div>
            <h2 className="text-base font-semibold tracking-tight text-foreground">
              Recent Calls
            </h2>
            <p className="text-xs text-muted-foreground">
              Click any row to open the full transcript.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative hidden sm:block">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search calls"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-9 w-52 rounded-lg border-border bg-secondary/60 pl-9 text-sm shadow-none"
              />
            </div>
            <Button variant="outline" size="sm" className="h-9 gap-1.5">
              <Filter className="h-3.5 w-3.5" /> Filter
            </Button>
            <Button variant="outline" size="sm" className="h-9 gap-1.5">
              <Download className="h-3.5 w-3.5" /> Export
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20 text-muted-foreground">
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Loading calls...
          </div>
        ) : error ? (
          <div className="py-10 text-center text-sm text-destructive">{error}</div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center text-sm text-muted-foreground">
            No calls found for this account yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-border/60 bg-secondary/40 hover:bg-secondary/40">
                  <TableHead className="w-28 text-[11px] font-semibold uppercase tracking-wider">Time</TableHead>
                  <TableHead className="text-[11px] font-semibold uppercase tracking-wider">Caller</TableHead>
                  <TableHead className="text-[11px] font-semibold uppercase tracking-wider">Company</TableHead>
                  <TableHead className="text-[11px] font-semibold uppercase tracking-wider">Duration</TableHead>
                  <TableHead className="text-[11px] font-semibold uppercase tracking-wider">Status</TableHead>
                  <TableHead className="text-[11px] font-semibold uppercase tracking-wider">Satisfaction</TableHead>
                  <TableHead className="text-[11px] font-semibold uppercase tracking-wider">Two-Word Summary</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((call, i) => {
                  const sat = satisfactionMeta[call.satisfaction] || satisfactionMeta["None"];
                  const isPickup = call.status?.toLowerCase() === "pickup";
                  const durationStr = call.call_duration
                    ? `${Math.floor(call.call_duration / 60).toString().padStart(2, "0")}:${(call.call_duration % 60).toString().padStart(2, "0")}`
                    : "00:00";

                  return (
                    <TableRow
                      key={call.id}
                      onClick={() => handleRowClick(call)}
                      className="cursor-pointer border-border/60 transition-colors hover:bg-[hsl(var(--primary-soft))]/40"
                    >
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-9 w-9">
                            <AvatarFallback className={cn("text-xs font-semibold", palette[i % palette.length])}>
                              {initialsOf(call.caller_name || "Unknown")}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-foreground">
                              {call.caller_name || "Unknown"}
                            </p>
                            <p className="truncate text-xs text-muted-foreground">
                              {new Date(call.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-foreground">{call.company || "—"}</span>
                      </TableCell>
                      <TableCell>
                        <span className="font-mono text-sm tabular-nums text-foreground">{durationStr}</span>
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={cn(
                            "rounded-full border-transparent px-2.5 py-0.5 text-[11px] font-semibold",
                            isPickup
                              ? "bg-success-soft text-success hover:bg-success-soft"
                              : "bg-[hsl(var(--destructive-soft))] text-destructive hover:bg-[hsl(var(--destructive-soft))]"
                          )}
                        >
                          <span className={cn("mr-1.5 inline-block h-1.5 w-1.5 rounded-full", isPickup ? "bg-success" : "bg-destructive")} />
                          {call.status || "—"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className={cn("inline-flex items-center gap-1.5 text-sm font-medium", sat.tone)}>
                          <span className="text-base leading-none">{sat.emoji}</span>
                          {call.satisfaction || "—"}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="rounded-md border-border bg-secondary/60 font-medium text-foreground">
                          {call.two_word_summary || "—"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </section>

      <CallDetailDrawer call={selected} open={open} onOpenChange={setOpen} />
    </DashboardLayout>
  );
};

export default Dashboard;
