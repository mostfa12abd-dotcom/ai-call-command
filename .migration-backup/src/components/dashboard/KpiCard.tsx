import { LucideIcon, TrendingDown, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface KpiCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  trend?: { value: string; positive?: boolean };
  tone?: "primary" | "success" | "destructive" | "warning";
}

const toneStyles: Record<NonNullable<KpiCardProps["tone"]>, string> = {
  primary: "bg-[hsl(var(--primary-soft))] text-primary",
  success: "bg-success-soft text-success",
  destructive: "bg-[hsl(var(--destructive-soft))] text-destructive",
  warning: "bg-warning-soft text-warning",
};

export function KpiCard({ label, value, icon: Icon, trend, tone = "primary" }: KpiCardProps) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-border/70 bg-card p-5 shadow-card transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/20 hover:shadow-elevated">
      <div className="flex items-start justify-between gap-3">
        <div className={cn("flex h-10 w-10 items-center justify-center rounded-xl", toneStyles[tone])}>
          <Icon className="h-[18px] w-[18px]" strokeWidth={2.25} />
        </div>
        {trend && (
          <span
            className={cn(
              "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold",
              trend.positive
                ? "bg-success-soft text-success"
                : "bg-[hsl(var(--destructive-soft))] text-destructive",
            )}
          >
            {trend.positive ? (
              <TrendingUp className="h-3 w-3" strokeWidth={2.5} />
            ) : (
              <TrendingDown className="h-3 w-3" strokeWidth={2.5} />
            )}
            {trend.value}
          </span>
        )}
      </div>
      <div className="mt-4">
        <p className="text-[13px] font-medium text-muted-foreground">{label}</p>
        <p className="mt-1 text-[28px] font-bold leading-tight tracking-tight text-foreground">
          {value}
        </p>
      </div>
    </div>
  );
}
