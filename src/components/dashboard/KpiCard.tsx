import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface KpiCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  tone?: "success" | "destructive" | "primary" | "warning";
}

const toneStyles: Record<NonNullable<KpiCardProps["tone"]>, string> = {
  success: "border-success/40 text-success",
  destructive: "border-destructive/40 text-destructive",
  primary: "border-primary/40 text-primary",
  warning: "border-warning/50 text-warning",
};

export function KpiCard({ label, value, icon: Icon, tone = "primary" }: KpiCardProps) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-border/70 bg-card p-5 shadow-card transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/20 hover:shadow-elevated">
      <div className="flex items-start justify-between gap-4">
        <div
          className={cn(
            "flex h-12 w-12 items-center justify-center rounded-xl border-2 bg-card",
            toneStyles[tone],
          )}
        >
          <Icon className="h-5 w-5" strokeWidth={2} />
        </div>
        <p className="text-3xl font-bold tracking-tight text-foreground md:text-[32px]">{value}</p>
      </div>
      <p className="mt-3 text-sm font-medium text-muted-foreground">{label}</p>
    </div>
  );
}
