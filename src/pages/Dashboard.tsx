import { useState } from "react";
import {
  Phone,
  Clock,
  PhoneMissed,
  PhoneForwarded,
  CalendarCheck,
  Timer,
  Filter,
  Download,
  Search,
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
import { calls, kpis, type CallRecord } from "@/data/mockData";
import { cn } from "@/lib/utils";

const satisfactionMeta: Record<string, { emoji: string; tone: string }> = {
  Happy: { emoji: "😊", tone: "text-success" },
  Neutral: { emoji: "😐", tone: "text-warning" },
  Angry: { emoji: "😠", tone: "text-destructive" },
};

const Dashboard = () => {
  const [selected, setSelected] = useState<CallRecord | null>(null);
  const [open, setOpen] = useState(false);

  const handleRowClick = (call: CallRecord) => {
    setSelected(call);
    setOpen(true);
  };

  return (
    <DashboardLayout
      title="AI Voice Call Center"
      breadcrumb={["Dashboard", "AI Voice Call Center", "Overview"]}
    >
      {/* KPI Grid */}
      <section className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4 xl:grid-cols-6">
        <KpiCard label="Total Calls" value={kpis.totalCalls.toLocaleString()} icon={Phone} tone="primary" trend={{ value: "+12.4%", positive: true }} />
        <KpiCard label="Avg Call Duration" value={kpis.avgDuration} icon={Clock} tone="primary" trend={{ value: "+2.1%", positive: true }} />
        <KpiCard label="Missed Calls" value={kpis.missedCalls} icon={PhoneMissed} tone="destructive" trend={{ value: "-8.3%", positive: true }} />
        <KpiCard label="Recall AFM" value={kpis.recallAfm} icon={PhoneForwarded} tone="warning" trend={{ value: "+4.7%", positive: true }} />
        <KpiCard label="Appointments" value={kpis.appointments} icon={CalendarCheck} tone="success" trend={{ value: "+18.0%", positive: true }} />
        <KpiCard label="Total Call Time" value={kpis.totalCallTime} icon={Timer} tone="primary" trend={{ value: "+6.2%", positive: true }} />
      </section>

      {/* Recent Calls Table */}
      <section className="mt-6 overflow-hidden rounded-2xl border border-border/70 bg-card shadow-card">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 px-5 py-4">
          <div>
            <h2 className="text-base font-semibold tracking-tight text-foreground">Recent Calls</h2>
            <p className="text-xs text-muted-foreground">Click any row to open the full transcript.</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative hidden sm:block">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search calls"
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

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-border/60 bg-secondary/40 hover:bg-secondary/40">
                <TableHead className="text-[11px] font-semibold uppercase tracking-wider">Caller</TableHead>
                <TableHead className="text-[11px] font-semibold uppercase tracking-wider">Company</TableHead>
                <TableHead className="text-[11px] font-semibold uppercase tracking-wider">Duration</TableHead>
                <TableHead className="text-[11px] font-semibold uppercase tracking-wider">Status</TableHead>
                <TableHead className="text-[11px] font-semibold uppercase tracking-wider">Satisfaction</TableHead>
                <TableHead className="text-[11px] font-semibold uppercase tracking-wider">Two-Word Summary</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {calls.map((call) => {
                const sat = satisfactionMeta[call.customFields.satisfaction];
                return (
                  <TableRow
                    key={call.id}
                    onClick={() => handleRowClick(call)}
                    className="cursor-pointer border-border/60 transition-colors hover:bg-[hsl(var(--primary-soft))]/40"
                  >
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9">
                          <AvatarFallback className={cn("text-xs font-semibold", call.caller.avatarColor)}>
                            {call.caller.initials}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-foreground">{call.caller.name}</p>
                          <p className="truncate text-xs text-muted-foreground">{call.phone}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-foreground">{call.company}</span>
                    </TableCell>
                    <TableCell>
                      <span className="font-mono text-sm tabular-nums text-foreground">{call.duration}</span>
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={cn(
                          "rounded-full border-transparent px-2.5 py-0.5 text-[11px] font-semibold",
                          call.status === "Pickups"
                            ? "bg-success-soft text-success hover:bg-success-soft"
                            : "bg-[hsl(var(--destructive-soft))] text-destructive hover:bg-[hsl(var(--destructive-soft))]",
                        )}
                      >
                        <span className={cn("mr-1.5 inline-block h-1.5 w-1.5 rounded-full",
                          call.status === "Pickups" ? "bg-success" : "bg-destructive")} />
                        {call.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className={cn("inline-flex items-center gap-1.5 text-sm font-medium", sat.tone)}>
                        <span className="text-base leading-none">{sat.emoji}</span>
                        {call.customFields.satisfaction}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="rounded-md border-border bg-secondary/60 font-medium text-foreground">
                        {call.customFields.summary}
                      </Badge>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </section>

      <CallDetailDrawer call={selected} open={open} onOpenChange={setOpen} />
    </DashboardLayout>
  );
};

export default Dashboard;
