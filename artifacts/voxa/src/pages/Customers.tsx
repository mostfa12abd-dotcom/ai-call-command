import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Phone, Building2, Loader2, Mail, DollarSign } from "lucide-react";
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
  (name || "?").split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase();

const Customers = () => {
  const navigate = useNavigate();
  const { customers, loading, error } = useCustomersData();
  const { t, dir } = useLanguage();
  const [search, setSearch] = useState("");

  const filtered = customers.filter(
    (c) =>
      c.name?.toLowerCase().includes(search.toLowerCase()) ||
      c.company?.toLowerCase().includes(search.toLowerCase()) ||
      c.phone?.includes(search)
  );

  return (
    <DashboardLayout
      title={t("customers.title")}
      breadcrumb={[t("customers.title")]}
    >
      <section className="overflow-hidden rounded-2xl border border-border/70 bg-card shadow-card">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 px-5 py-4">
          <div>
            <h2 className="text-base font-semibold tracking-tight text-foreground">
              {t("customers.allTitle")}
              <span className={cn("rounded-full bg-secondary px-2 py-0.5 text-xs font-medium text-muted-foreground", dir === "rtl" ? "mr-2" : "ml-2")}>
                {loading ? "..." : filtered.length}
              </span>
            </h2>
            <p className="text-xs text-muted-foreground">
              {t("customers.allSubtitle")}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className={cn("pointer-events-none absolute top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground", dir === "rtl" ? "right-3" : "left-3")} />
              <Input
                placeholder={t("customers.searchPlaceholder")}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className={cn("h-9 w-56 rounded-lg border-border bg-secondary/60 text-sm shadow-none", dir === "rtl" ? "pr-9" : "pl-9")}
              />
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20 text-muted-foreground">
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            {t("customers.loading")}
          </div>
        ) : error ? (
          <div className="py-10 text-center text-sm text-destructive">{error}</div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center text-sm text-muted-foreground">
            {t("customers.empty")}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-border/60 bg-secondary/40 hover:bg-secondary/40">
                  <TableHead className="text-[11px] font-semibold uppercase tracking-wider">{t("customers.col.customer")}</TableHead>
                  <TableHead className="text-[11px] font-semibold uppercase tracking-wider">{t("customers.col.phone")}</TableHead>
                  <TableHead className="text-[11px] font-semibold uppercase tracking-wider">{t("dashboard.kpi.totalCredits" as any)}</TableHead>
                  <TableHead className="text-[11px] font-semibold uppercase tracking-wider">{t("common.status" as any)}</TableHead>
                  <TableHead className="text-[11px] font-semibold uppercase tracking-wider">{t("common.completed" as any)}</TableHead>
                  <TableHead className="text-[11px] font-semibold uppercase tracking-wider">{t("customers.col.totalCalls")}</TableHead>
                  <TableHead className="text-[11px] font-semibold uppercase tracking-wider">{t("customers.col.lastCall")}</TableHead>
                  <TableHead className="text-[11px] font-semibold uppercase tracking-wider">{t("customers.col.actions")}</TableHead>
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
                        <div>
                          <p className="text-sm font-semibold text-foreground">{c.name}</p>
                          <p className="text-[10px] text-muted-foreground">{c.company !== "—" ? c.company : ""}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-0.5">
                        <span className="flex items-center gap-1.5 text-sm text-foreground">
                          {c.phone && c.phone !== "—" ? (
                            <>
                              <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                              {c.phone}
                            </>
                          ) : <span className="text-muted-foreground">—</span>}
                        </span>
                        {c.email && (
                          <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <Mail className="h-3 w-3" />
                            {c.email}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="flex items-center gap-1 font-mono text-sm tabular-nums text-foreground">
                        <DollarSign className="h-3.5 w-3.5 text-muted-foreground" />
                        {(c.total_credits ?? 0).toFixed(3)}
                      </span>
                    </TableCell>
                    <TableCell>
                      {(() => {
                        const status = c.followup_status?.toLowerCase();
                        if (status === "booked online") {
                          return (
                            <span className="inline-flex items-center rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-medium text-blue-700">
                              {t("status.bookedOnline" as any)}
                            </span>
                          );
                        }
                        if (status === "booked ftf") {
                          return (
                            <span className="inline-flex items-center rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-medium text-emerald-700">
                              {t("status.bookedFTF" as any)}
                            </span>
                          );
                        }
                        // Default to follow up (yellow)
                        return (
                          <span className="inline-flex items-center rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-medium text-amber-700">
                            {t("status.followUp" as any)}
                          </span>
                        );
                      })()}
                    </TableCell>
                    <TableCell>
                      {c.call_completed ? (
                        <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                          ✓
                        </span>
                      ) : (
                        <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-rose-100 text-rose-700">
                          ✗
                        </span>
                      )}
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
                        {t("common.viewProfile")}
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
