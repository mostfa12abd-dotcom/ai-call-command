import { useMemo, useState } from "react";
import { PhoneCall, PhoneMissed, Clock, Phone, RotateCcw, Play, Search, Filter } from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { KpiCard } from "@/components/dashboard/KpiCard";
import { CallDetailDrawer } from "@/components/dashboard/CallDetailDrawer";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { leads, kpis, type LeadRecord, type LeadStatus } from "@/data/mockData";
import { cn } from "@/lib/utils";

const statusColor: Record<LeadStatus, string> = {
  New: "text-primary",
  Qualified: "text-success",
  Contacted: "text-warning",
  Paid: "text-success",
  "Not Interested": "text-destructive",
};

const Dashboard = () => {
  const [selected, setSelected] = useState<LeadRecord | null>(null);
  const [open, setOpen] = useState(false);
  const [checked, setChecked] = useState<Record<string, boolean>>({});

  const selectedCount = useMemo(
    () => Object.values(checked).filter(Boolean).length,
    [checked],
  );
  const allChecked = selectedCount === leads.length;

  const toggleAll = () => {
    if (allChecked) setChecked({});
    else setChecked(Object.fromEntries(leads.map((l) => [l.id, true])));
  };

  const handleRowClick = (lead: LeadRecord) => {
    setSelected(lead);
    setOpen(true);
  };

  const handleCall = (e: React.MouseEvent, lead: LeadRecord) => {
    e.stopPropagation();
    setSelected(lead);
    setOpen(true);
  };

  return (
    <DashboardLayout
      title="AI Voice Call Center"
      breadcrumb={["App", "AI Voice Call Center", "Dialer"]}
    >
      {/* KPI Grid — 4 cards matching reference */}
      <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <KpiCard label="Connected" value={kpis.connected} icon={PhoneCall} tone="success" />
        <KpiCard label="Missed" value={kpis.missed} icon={PhoneMissed} tone="destructive" />
        <KpiCard label="Avg Call Duration" value={kpis.avgDuration} icon={Clock} tone="primary" />
        <KpiCard label="Total Call" value={kpis.totalCalls} icon={Phone} tone="warning" />
      </section>

      {/* Auto-Dial Controls */}
      <section className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border/70 bg-card p-5 shadow-card">
        <div>
          <h2 className="text-base font-semibold tracking-tight text-foreground">Auto-Dial Controls</h2>
          <p className="text-xs text-muted-foreground">
            {selectedCount} {selectedCount === 1 ? "lead" : "leads"} selected
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="h-9 gap-1.5 rounded-full px-4"
            onClick={() => setChecked({})}
          >
            <RotateCcw className="h-3.5 w-3.5" /> Reset
          </Button>
          <Button
            size="sm"
            className="h-9 gap-1.5 rounded-full bg-foreground px-4 text-background hover:bg-foreground/90"
            disabled={selectedCount === 0}
          >
            <Play className="h-3.5 w-3.5 fill-current" /> Start Auto Dial
          </Button>
        </div>
      </section>

      {/* Leads Table */}
      <section className="mt-5 overflow-hidden rounded-2xl border border-border/70 bg-card shadow-card">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 px-5 py-4">
          <div>
            <h2 className="text-base font-semibold tracking-tight text-foreground">Leads</h2>
            <p className="text-xs text-muted-foreground">Click any row to open the full call transcript.</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative hidden sm:block">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search leads"
                className="h-9 w-52 rounded-lg border-border bg-secondary/60 pl-9 text-sm shadow-none"
              />
            </div>
            <Button variant="outline" size="sm" className="h-9 gap-1.5">
              <Filter className="h-3.5 w-3.5" /> Filter
            </Button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-border/60 bg-secondary/40 hover:bg-secondary/40">
                <TableHead className="w-10 pl-5">
                  <Checkbox checked={allChecked} onCheckedChange={toggleAll} />
                </TableHead>
                <TableHead className="text-[11px] font-semibold uppercase tracking-wider">Name</TableHead>
                <TableHead className="text-[11px] font-semibold uppercase tracking-wider">Company</TableHead>
                <TableHead className="text-[11px] font-semibold uppercase tracking-wider">Phone</TableHead>
                <TableHead className="text-[11px] font-semibold uppercase tracking-wider">Status</TableHead>
                <TableHead className="text-[11px] font-semibold uppercase tracking-wider">Next Action</TableHead>
                <TableHead className="text-right text-[11px] font-semibold uppercase tracking-wider pr-5">
                  Action
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {leads.map((lead) => (
                <TableRow
                  key={lead.id}
                  onClick={() => handleRowClick(lead)}
                  className="cursor-pointer border-border/60 transition-colors hover:bg-[hsl(var(--primary-soft))]/40"
                >
                  <TableCell className="pl-5" onClick={(e) => e.stopPropagation()}>
                    <Checkbox
                      checked={!!checked[lead.id]}
                      onCheckedChange={(v) =>
                        setChecked((prev) => ({ ...prev, [lead.id]: !!v }))
                      }
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9">
                        <AvatarFallback className={cn("text-xs font-semibold", lead.avatarColor)}>
                          {lead.initials}
                        </AvatarFallback>
                      </Avatar>
                      <p className="text-sm font-semibold text-foreground">{lead.name}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-foreground">{lead.company}</span>
                  </TableCell>
                  <TableCell>
                    <span className="font-mono text-sm tabular-nums text-foreground">{lead.phone}</span>
                  </TableCell>
                  <TableCell>
                    <span className={cn("text-sm font-semibold", statusColor[lead.status])}>
                      {lead.status}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-foreground">{lead.nextAction}</span>
                  </TableCell>
                  <TableCell className="pr-5 text-right">
                    <Button
                      size="sm"
                      onClick={(e) => handleCall(e, lead)}
                      className="h-8 gap-1.5 rounded-md bg-primary px-3 text-xs font-semibold text-primary-foreground shadow-sm hover:bg-primary/90"
                    >
                      <PhoneCall className="h-3 w-3" /> Call
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </section>

      <CallDetailDrawer lead={selected} open={open} onOpenChange={setOpen} />
    </DashboardLayout>
  );
};

export default Dashboard;
