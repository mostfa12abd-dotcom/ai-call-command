import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LeadRecord } from "@/data/mockData";
import { Calendar, Clock, Mail, Phone, CheckCircle2, CalendarPlus } from "lucide-react";
import { cn } from "@/lib/utils";

interface CallDetailDrawerProps {
  lead: LeadRecord | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const satisfactionMeta: Record<string, { emoji: string; tone: string }> = {
  Happy: { emoji: "😊", tone: "bg-success-soft text-success" },
  Neutral: { emoji: "😐", tone: "bg-warning-soft text-warning" },
  Angry: { emoji: "😠", tone: "bg-[hsl(var(--destructive-soft))] text-destructive" },
};

export function CallDetailDrawer({ lead, open, onOpenChange }: CallDetailDrawerProps) {
  if (!lead) return null;
  const sat = satisfactionMeta[lead.lastCall.satisfaction];

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full overflow-y-auto p-0 sm:max-w-xl">
        {/* Header */}
        <div className="border-b border-border bg-gradient-to-br from-[hsl(var(--primary-soft))] to-card px-6 pb-5 pt-6">
          <div className="flex items-start gap-4">
            <Avatar className="h-14 w-14 ring-4 ring-background">
              <AvatarFallback className={cn("text-base font-semibold", lead.avatarColor)}>
                {lead.initials}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <h2 className="truncate text-xl font-bold tracking-tight text-foreground">{lead.name}</h2>
              <p className="truncate text-sm text-muted-foreground">{lead.company}</p>
              <div className="mt-2 flex flex-wrap items-center gap-1.5">
                <Badge className={cn("rounded-full border-transparent px-2.5 py-0.5 text-[11px] font-semibold", sat.tone)}>
                  {sat.emoji} {lead.lastCall.satisfaction}
                </Badge>
                <Badge variant="outline" className="rounded-full text-[11px]">
                  Next: {lead.nextAction}
                </Badge>
              </div>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3">
            <InfoTile icon={Clock} label="Duration" value={lead.lastCall.duration} />
            <InfoTile icon={Calendar} label="When" value={lead.lastCall.date} />
            <InfoTile icon={Phone} label="Phone" value={lead.phone} />
            <InfoTile icon={Mail} label="Email" value={lead.email} />
          </div>
        </div>

        <div className="space-y-6 px-6 py-6">
          <section>
            <div className="mb-2 flex items-center justify-between">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Summary</h3>
              <Badge variant="outline" className="text-[10px]">{lead.lastCall.summary}</Badge>
            </div>
            <p className="text-sm leading-relaxed text-foreground/90">{lead.lastCall.longSummary}</p>
          </section>

          <section>
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Total Conversation
            </h3>
            <div className="space-y-3 rounded-xl border border-border bg-secondary/40 p-3">
              {lead.lastCall.transcript.map((line, i) => (
                <div
                  key={i}
                  className={cn("flex gap-2", line.speaker === "Agent" ? "flex-row" : "flex-row-reverse")}
                >
                  <div
                    className={cn(
                      "max-w-[80%] rounded-2xl px-3.5 py-2 text-sm shadow-sm",
                      line.speaker === "Agent"
                        ? "rounded-tl-sm bg-card text-foreground"
                        : "rounded-tr-sm bg-primary text-primary-foreground",
                    )}
                  >
                    <div
                      className={cn(
                        "mb-0.5 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-wider",
                        line.speaker === "Agent" ? "text-muted-foreground" : "text-primary-foreground/80",
                      )}
                    >
                      <span>{line.speaker}</span>
                      <span>·</span>
                      <span>{line.time}</span>
                    </div>
                    <p className="leading-snug">{line.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <div className="flex gap-2 pt-2">
            <Button variant="outline" className="flex-1">
              <CheckCircle2 className="h-4 w-4" /> Mark as Reviewed
            </Button>
            <Button className="flex-1 bg-gradient-primary text-primary-foreground hover:opacity-90">
              <CalendarPlus className="h-4 w-4" /> Schedule Follow-up
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function InfoTile({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Clock;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-border/60 bg-card/80 p-3 backdrop-blur-sm">
      <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        <Icon className="h-3 w-3" /> {label}
      </div>
      <p className="mt-1 truncate text-sm font-semibold text-foreground">{value}</p>
    </div>
  );
}
