import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Phone, Building2, Loader2 } from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
import { useCustomersData } from "@/hooks/useCustomersData";
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
  (name || "?").split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase();

const Customers = () => {
  const navigate = useNavigate();
  const { customers, loading, error } = useCustomersData();
  const [search, setSearch] = useState("");

  const filtered = customers.filter(
    (c) =>
      c.name?.toLowerCase().includes(search.toLowerCase()) ||
      c.company?.toLowerCase().includes(search.toLowerCase()) ||
      c.phone?.includes(search)
  );

  return (
    <DashboardLayout
      title="Customers"
      breadcrumb={["Customers"]}
    >
      <section className="overflow-hidden rounded-2xl border border-border/70 bg-card shadow-card">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 px-5 py-4">
          <div>
            <h2 className="text-base font-semibold tracking-tight text-foreground">
              All Customers
              <span className="ml-2 rounded-full bg-secondary px-2 py-0.5 text-xs font-medium text-muted-foreground">
                {loading ? "..." : filtered.length}
              </span>
            </h2>
            <p className="text-xs text-muted-foreground">
              Unique callers across all your call campaigns.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search customers"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-9 w-56 rounded-lg border-border bg-secondary/60 pl-9 text-sm shadow-none"
              />
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20 text-muted-foreground">
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Loading customers...
          </div>
        ) : error ? (
          <div className="py-10 text-center text-sm text-destructive">{error}</div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center text-sm text-muted-foreground">
            No customers found for this account yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-border/60 bg-secondary/40 hover:bg-secondary/40">
                  <TableHead className="text-[11px] font-semibold uppercase tracking-wider">Customer</TableHead>
                  <TableHead className="text-[11px] font-semibold uppercase tracking-wider">Company</TableHead>
                  <TableHead className="text-[11px] font-semibold uppercase tracking-wider">Phone</TableHead>
                  <TableHead className="text-[11px] font-semibold uppercase tracking-wider">Total Calls</TableHead>
                  <TableHead className="text-[11px] font-semibold uppercase tracking-wider">Last Call</TableHead>
                  <TableHead className="text-[11px] font-semibold uppercase tracking-wider">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((c, i) => (
                  <TableRow
                    key={c.id}
                    onClick={() => navigate(`/customers/${c.id}`)}
                    className="cursor-pointer border-border/60 transition-colors hover:bg-[hsl(var(--primary-soft))]/40"
                  >
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9">
                          <AvatarFallback className={cn("text-xs font-semibold", palette[i % palette.length])}>
                            {initialsOf(c.name)}
                          </AvatarFallback>
                        </Avatar>
                        <p className="text-sm font-semibold text-foreground">{c.name}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="flex items-center gap-1.5 text-sm text-foreground">
                        {c.company ? (
                          <>
                            <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
                            {c.company}
                          </>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                        {c.phone ? (
                          <>
                            <Phone className="h-3.5 w-3.5" />
                            {c.phone}
                          </>
                        ) : "—"}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="font-mono text-sm font-semibold tabular-nums text-foreground">
                        {c.call_count ?? 0}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground">{c.last_call || "—"}</span>
                    </TableCell>
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 text-xs"
                        onClick={() => navigate(`/customers/${c.id}`)}
                      >
                        View Profile
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </section>
    </DashboardLayout>
  );
};

export default Customers;
