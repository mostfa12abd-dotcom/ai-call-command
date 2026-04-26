import { Plus, Search, Mail, Phone } from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
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
import { customers } from "@/data/mockData";
import { cn } from "@/lib/utils";

const statusTone: Record<string, string> = {
  Active: "bg-success-soft text-success",
  Lead: "bg-[hsl(var(--primary-soft))] text-primary",
  Churned: "bg-[hsl(var(--destructive-soft))] text-destructive",
};

const Customers = () => {
  return (
    <DashboardLayout
      title="Customers"
      breadcrumb={["Dashboard", "AI Voice Call Center", "Customers"]}
    >
      <section className="overflow-hidden rounded-2xl border border-border/70 bg-card shadow-card">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 px-5 py-4">
          <div>
            <h2 className="text-base font-semibold tracking-tight text-foreground">
              All Customers
              <span className="ml-2 rounded-full bg-secondary px-2 py-0.5 text-xs font-medium text-muted-foreground">
                {customers.length}
              </span>
            </h2>
            <p className="text-xs text-muted-foreground">Unique callers across all your call campaigns.</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search customers"
                className="h-9 w-56 rounded-lg border-border bg-secondary/60 pl-9 text-sm shadow-none"
              />
            </div>
            <Button size="sm" className="h-9 gap-1.5 bg-gradient-primary text-primary-foreground hover:opacity-90">
              <Plus className="h-3.5 w-3.5" /> Add Customer
            </Button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-border/60 bg-secondary/40 hover:bg-secondary/40">
                <TableHead className="text-[11px] font-semibold uppercase tracking-wider">Customer</TableHead>
                <TableHead className="text-[11px] font-semibold uppercase tracking-wider">Company</TableHead>
                <TableHead className="text-[11px] font-semibold uppercase tracking-wider">Contact</TableHead>
                <TableHead className="text-[11px] font-semibold uppercase tracking-wider">Total Calls</TableHead>
                <TableHead className="text-[11px] font-semibold uppercase tracking-wider">Last Contact</TableHead>
                <TableHead className="text-[11px] font-semibold uppercase tracking-wider">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {customers.map((c) => (
                <TableRow
                  key={c.id}
                  className="cursor-pointer border-border/60 transition-colors hover:bg-[hsl(var(--primary-soft))]/40"
                >
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9">
                        <AvatarFallback className={cn("text-xs font-semibold", c.avatarColor)}>
                          {c.initials}
                        </AvatarFallback>
                      </Avatar>
                      <p className="text-sm font-semibold text-foreground">{c.name}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-foreground">{c.company}</span>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-0.5 text-xs">
                      <span className="flex items-center gap-1.5 text-foreground">
                        <Mail className="h-3 w-3 text-muted-foreground" /> {c.email}
                      </span>
                      <span className="flex items-center gap-1.5 text-muted-foreground">
                        <Phone className="h-3 w-3" /> {c.phone}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="font-mono text-sm font-semibold tabular-nums text-foreground">
                      {c.totalCalls}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-muted-foreground">{c.lastContact}</span>
                  </TableCell>
                  <TableCell>
                    <Badge
                      className={cn(
                        "rounded-full border-transparent px-2.5 py-0.5 text-[11px] font-semibold",
                        statusTone[c.status],
                      )}
                    >
                      {c.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </section>
    </DashboardLayout>
  );
};

export default Customers;
