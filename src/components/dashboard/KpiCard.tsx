import { useId } from "react";
import { TrendingDown, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface KpiCardProps {
  label: string;
  description: string;
  value: string | number;
  trendPercent: number;
  trendUp: boolean;
  sparklineData: number[];
  tone?: "primary" | "success" | "destructive" | "warning";
}

function smoothPath(data: number[], w: number, h: number): string {
  const n = data.length;
  if (n < 2) return "";

  const max = Math.max(...data, 1);
  const min = Math.min(...data, 0);
  const range = max - min || 1;
  const stepX = w / (n - 1);
  const padY = 6;

  const points = data.map((d, i) => ({
    x: i * stepX,
    y: padY + (h - padY - 2) - ((d - min) / range) * (h - padY - 2),
  }));

  let d = `M ${points[0].x} ${points[0].y}`;

  for (let i = 0; i < n - 1; i++) {
    const xc = (points[i].x + points[i + 1].x) / 2;
    const yc = (points[i].y + points[i + 1].y) / 2;
    d += ` Q ${points[i].x} ${points[i].y} ${xc} ${yc}`;
  }

  d += ` L ${points[n - 1].x} ${points[n - 1].y}`;
  return d;
}

function areaPath(data: number[], w: number, h: number): string {
  const n = data.length;
  if (n < 2) return "";

  const max = Math.max(...data, 1);
  const min = Math.min(...data, 0);
  const range = max - min || 1;
  const stepX = w / (n - 1);
  const padY = 6;
  const bottom = h;

  const points = data.map((d, i) => ({
    x: i * stepX,
    y: padY + (h - padY - 2) - ((d - min) / range) * (h - padY - 2),
  }));

  let d = `M ${points[0].x} ${points[0].y}`;

  for (let i = 0; i < n - 1; i++) {
    const xc = (points[i].x + points[i + 1].x) / 2;
    const yc = (points[i].y + points[i + 1].y) / 2;
    d += ` Q ${points[i].x} ${points[i].y} ${xc} ${yc}`;
  }

  d += ` L ${points[n - 1].x} ${points[n - 1].y}`;
  d += ` L ${points[n - 1].x} ${bottom}`;
  d += ` L ${points[0].x} ${bottom} Z`;

  return d;
}

const toneHsl: Record<NonNullable<KpiCardProps["tone"]>, string> = {
  primary:     "262, 60%, 58%",
  success:     "152, 70%, 42%",
  destructive: "0, 84%, 60%",
  warning:     "38, 95%, 55%",
};

export function KpiCard({ label, description, value, trendPercent, trendUp, sparklineData, tone = "primary" }: KpiCardProps) {
  const rawId = useId();
  const id = rawId.replace(/[^a-zA-Z0-9]/g, "");
  const w = 200;
  const h = 48;
  const color = `hsl(${toneHsl[tone]})`;

  return (
    <div className="group glass relative flex flex-col overflow-hidden rounded-2xl bg-card shadow-card transition-all duration-300 hover:-translate-y-0.5 hover:shadow-elevated">
      <div className="p-5 pb-2">
        <div className="flex items-center justify-between gap-3">
          <p className="text-[13px] font-medium text-muted-foreground">{description}</p>
          <span
            className={cn(
              "inline-flex items-center gap-1 text-xs font-semibold shrink-0",
              trendUp ? "text-success" : "text-destructive",
            )}
          >
            {trendUp ? (
              <TrendingUp className="h-3 w-3" strokeWidth={2.5} />
            ) : (
              <TrendingDown className="h-3 w-3" strokeWidth={2.5} />
            )}
            {trendPercent}%
          </span>
        </div>

        <p className="mt-1 text-[28px] font-bold leading-tight tracking-tight text-foreground">
          {value}
        </p>
      </div>

      {sparklineData.length > 0 && (
        <div className="mt-auto rounded-b-2xl overflow-hidden">
          <svg viewBox={`0 0 ${w} ${h}`} className="h-12 w-full" preserveAspectRatio="none">
            <defs>
              <linearGradient id={`${id}-fill`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={color} stopOpacity={0.22} />
                <stop offset="100%" stopColor={color} stopOpacity={0.0} />
              </linearGradient>
              <filter id={`${id}-glow`} x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur in="SourceGraphic" stdDeviation={1.5} result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            <path
              d={areaPath(sparklineData, w, h)}
              fill={`url(#${id}-fill)`}
            />

            <path
              d={smoothPath(sparklineData, w, h)}
              fill="none"
              stroke={color}
              strokeWidth={1.5}
              strokeLinecap="round"
              strokeLinejoin="round"
              filter={`url(#${id}-glow)`}
            />
          </svg>
        </div>
      )}
    </div>
  );
}
