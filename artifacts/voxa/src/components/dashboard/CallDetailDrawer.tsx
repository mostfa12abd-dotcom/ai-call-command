import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, Phone, CheckCircle2, CalendarPlus, FileText, Play } from "lucide-react";
import { cn } from "@/lib/utils";
import { resolveDataPath, type TenantCustomAction } from "@/hooks/useDashboardData";
import { useState, useMemo, useEffect } from "react";

// Generic shape that works with both mock data and real Supabase data
export interface DrawerCall {
  id: string;
  caller: { name: string; initials: string; avatarColor: string };
  company: string;
  phone: string;
  email?: string;
  duration: string;
  durationSeconds: number;
  status: string;
  date: string;
  customFields: {
    satisfaction: string;
    summary: string;
    longSummary: string;
    // Can be either a pre-built transcript array OR a raw conversation string
    transcript?: { speaker: "Agent" | "Caller"; time: string; text: string; startTime?: number; endTime?: number }[];
    totalConversation?: string;
  };
  recordingUrl?: string;
  rawCall?: any;
  uiColumns?: { column_key: string; label: string; data_path: string; position: number; visible: boolean }[];
}

interface CallDetailDrawerProps {
  call: DrawerCall | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customActions?: TenantCustomAction[];
}

const satisfactionMeta: Record<string, { emoji: string; tone: string }> = {
  Happy: { emoji: "😊", tone: "bg-success-soft text-success" },
  Neutral: { emoji: "😐", tone: "bg-warning-soft text-warning" },
  Angry: { emoji: "😠", tone: "bg-[hsl(var(--destructive-soft))] text-destructive" },
  High: { emoji: "😊", tone: "bg-success-soft text-success" },
  Medium: { emoji: "😐", tone: "bg-warning-soft text-warning" },
  Low: { emoji: "😠", tone: "bg-[hsl(var(--destructive-soft))] text-destructive" },
  None: { emoji: "—", tone: "bg-secondary text-muted-foreground" },
};

function parseRawConversation(raw: string) {
  if (!raw) return [];
  // Split by labels like "AI:", "User:", "Caller:", "Assistant:"
  const parts = raw.split(/(AI:|User:|Caller:|Assistant:)/g).filter(p => p.trim().length > 0);
  const result: { speaker: string; text: string; time: string }[] = [];
  
  for (let i = 0; i < parts.length; i += 2) {
    const label = parts[i]?.replace(":", "").trim() || "User";
    const text = parts[i + 1]?.trim() || "";
    if (text) {
      result.push({ speaker: label, text, time: "" });
    }
  }
  
  return result.length > 0 ? result : [{ speaker: "User", text: raw, time: "" }];
}

export function CallDetailDrawer({ call, open, onOpenChange, customActions = [] }: CallDetailDrawerProps) {
  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioTime, setAudioTime] = useState(0);
  const [duration, setDuration] = useState(call?.durationSeconds || 0);

  // Sync state when drawer opens with a new call
  useEffect(() => {
    setIsPlaying(false);
    setAudioTime(0);
    setDuration(call?.durationSeconds || 0);
  }, [call]);

  // Prepare transcript items with exact timestamps from Vapi or fallback to estimation
  const transcriptItems = useMemo(() => {
    if (!call) return [];
    
    // Check if we have exact Vapi artifact messages (from rawCall or custom_data)
    const vapiMessages = call.rawCall?.artifact?.messages || call.rawCall?.custom_data?.artifact?.messages || call.rawCall?.custom_data?.message?.artifact?.messages;
    
    if (vapiMessages && Array.isArray(vapiMessages) && vapiMessages.length > 0) {
      // We have exact timestamps!
      const validMessages = vapiMessages.filter((m: any) => m.role === 'bot' || m.role === 'user');
      if (validMessages.length > 0) {
        return validMessages.map((msg: any) => {
          // Vapi provides 'secondsFromStart' which is the exact offset in the audio file!
          const startTimeSeconds = typeof msg.secondsFromStart === 'number' 
            ? msg.secondsFromStart 
            : (msg.time ? Math.max(0, (msg.time - validMessages[0].time) / 1000) : 0);
            
          const durationSeconds = msg.endTime && msg.time ? (msg.endTime - msg.time) / 1000 : 2;
          
          return {
            speaker: msg.role === 'bot' ? 'Agent' : 'Caller',
            text: msg.message,
            time: msg.time ? new Date(msg.time).toLocaleTimeString() : "",
            startTime: startTimeSeconds,
            endTime: startTimeSeconds + durationSeconds
          };
        });
      }
    }

    // Fallback logic if exact timestamps are not available
    const hasStructuredTranscript = call.customFields?.transcript && call.customFields.transcript.length > 0;
    const rawConversation = call.customFields?.totalConversation || "";

    if (!hasStructuredTranscript && !rawConversation) return [];
    
    const items = hasStructuredTranscript 
      ? call.customFields.transcript! 
      : parseRawConversation(rawConversation);
      
    // If we don't have accurate timestamps from the backend, we estimate them based on text length
    const totalChars = items.reduce((acc, item) => acc + (item.text?.length || 0), 0);
    // Use an estimated duration if we don't have an exact one from audio or call data
    const safeDuration = duration > 0 ? duration : ((call.durationSeconds && call.durationSeconds > 0) ? call.durationSeconds : 60);
    let currentEstimatedTime = 0;

    return items.map(item => {
      const itemDuration = totalChars > 0 ? ((item.text?.length || 0) / totalChars) * safeDuration : 0;
      const startTime = (item as any).startTime !== undefined ? (item as any).startTime : currentEstimatedTime;
      currentEstimatedTime += itemDuration;
      
      return { ...item, startTime, endTime: startTime + itemDuration };
    });
  }, [call, duration]);

  if (!call) return null;

  const sat = satisfactionMeta[call.customFields.satisfaction] ?? satisfactionMeta["None"];
  const isPickup = call.status === "Pickups" || call.status === "Pickup";

  const hasStructuredTranscript = call.customFields.transcript && call.customFields.transcript.length > 0;
  const rawConversation = call.customFields.totalConversation || "";

  const handleCustomAction = async (action: TenantCustomAction) => {
    try {
      setLoadingAction(action.action_id);
      const payload = {
        tenant_id: call.rawCall?.tenant_id,
        call_id: call.id,
        phone: call.phone,
        caller: call.caller.name,
        company: call.company,
        raw_call_data: call.rawCall
      };

      await fetch(action.webhook_url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      alert(`Action "${action.label}" triggered successfully!`);
    } catch (err) {
      alert("Failed to trigger action.");
    } finally {
      setLoadingAction(null);
    }
  };

  const drawerActions = customActions.filter(a => a.page_location === 'call_drawer');

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full overflow-y-auto p-0 sm:max-w-none sm:w-1/2"
      >
        {/* Header */}
        <div className="border-b border-border bg-gradient-to-br from-[hsl(var(--primary-soft))] to-card px-6 pb-5 pt-6">
          <div className="flex items-start gap-4">
            <Avatar className="h-14 w-14 ring-4 ring-background">
              <AvatarFallback className={cn("text-base font-semibold", call.caller.avatarColor)}>
                {call.caller.initials}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <h2 className="truncate text-xl font-bold tracking-tight text-foreground">
                {call.caller.name}
              </h2>
              <p className="truncate text-sm text-muted-foreground">{call.company}</p>
              <div className="mt-2 flex flex-wrap items-center gap-1.5">
                <Badge
                  className={cn(
                    "rounded-full border-transparent px-2.5 py-0.5 text-[11px] font-semibold",
                    isPickup
                      ? "bg-success-soft text-success hover:bg-success-soft"
                      : "bg-[hsl(var(--destructive-soft))] text-destructive hover:bg-[hsl(var(--destructive-soft))]"
                  )}
                >
                  {call.status}
                </Badge>
                <Badge
                  className={cn(
                    "rounded-full border-transparent px-2.5 py-0.5 text-[11px] font-semibold",
                    sat.tone
                  )}
                >
                  {sat.emoji} {call.customFields.satisfaction}
                </Badge>
              </div>
            </div>
          </div>

          <div className="mt-5 space-y-3">
            <InfoTile icon={Calendar} label="When" value={call.date} />
            {call.uiColumns && call.uiColumns.filter(c => c.column_key !== "caller_name" && c.column_key !== "status" && c.column_key !== "satisfaction").length > 0 && (
              <div className="grid grid-cols-2 gap-3">
                {call.uiColumns.filter(c => c.column_key !== "caller_name" && c.column_key !== "status" && c.column_key !== "satisfaction").map((col) => (
                  <InfoTile 
                    key={col.column_key}
                    icon={col.column_key === "call_duration" ? Clock : FileText} 
                    label={col.label} 
                    value={call.rawCall ? resolveDataPath(call.rawCall, col.data_path) : "—"} 
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6 px-6 py-6">
          {/* Summary */}
          <section>
            <div className="mb-2 flex items-center justify-between">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Summary
              </h3>
              {call.customFields.summary && call.customFields.summary !== "—" && (
                <Badge variant="outline" className="text-[10px]">
                  {call.customFields.summary}
                </Badge>
              )}
            </div>
            <p className="text-sm leading-relaxed text-foreground/90">
              {call.customFields.longSummary || "No summary available for this call."}
            </p>
          </section>

          {/* Call Recording */}
          {call.recordingUrl && (
            <section className="rounded-xl border border-border bg-secondary/20 p-4">
              <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                <Play className="h-3 w-3" /> Call Recording
              </h3>
              <audio 
                controls 
                className="w-full h-10"
                src={call.recordingUrl}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                onTimeUpdate={(e) => setAudioTime(e.currentTarget.currentTime)}
                onLoadedMetadata={(e) => {
                  if (e.currentTarget.duration && e.currentTarget.duration !== Infinity) {
                    setDuration(e.currentTarget.duration);
                  }
                }}
              >
                Your browser does not support the audio element.
              </audio>
            </section>
          )}

          {/* Transcript / Conversation */}
          <section>
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Total Conversation
            </h3>

            {transcriptItems.length > 0 ? (
              <div className="space-y-3 rounded-xl border border-border bg-secondary/40 p-3">
                {transcriptItems.map((line, i) => {
                  const isAI = line.speaker === "Agent" || line.speaker === "AI" || line.speaker.includes("AI");
                  
                  // Sync Logic: Show items only if their start time has passed.
                  // isSyncMode triggers when you hit play or move the slider.
                  const isSyncMode = isPlaying || audioTime > 0;
                  
                  // Added a tiny buffer (0.5s) to start showing slightly earlier than strictly needed
                  const isVisible = !isSyncMode || (line.startTime! <= audioTime + 0.5);

                  if (!isVisible) return null;

                  return (
                    <div
                      key={i}
                      className={cn(
                        "flex gap-2 transition-all duration-500 ease-in-out",
                        isAI ? "flex-row-reverse" : "flex-row",
                        // Animation to slide in gently
                        "animate-in fade-in slide-in-from-bottom-2"
                      )}
                    >
                      <div
                        className={cn(
                          "max-w-[80%] rounded-2xl px-3.5 py-2 text-sm shadow-sm",
                          isAI
                            ? "rounded-tr-sm bg-primary text-primary-foreground"
                            : "rounded-tl-sm bg-card text-foreground"
                        )}
                      >
                        <div
                          className={cn(
                            "mb-0.5 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-wider",
                            isAI
                              ? "flex-row-reverse text-primary-foreground/80"
                              : "text-muted-foreground"
                          )}
                        >
                          <span>{isAI ? "AI Assistant" : "Customer"}</span>
                        </div>
                        <p className="leading-snug">{line.text}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="rounded-xl border border-border bg-secondary/40 p-6 text-center text-sm text-muted-foreground">
                No conversation transcript available for this call.
              </div>
            )}
          </section>

          {/* Footer actions */}
          <div className="flex flex-wrap gap-2 pt-2">
            <Button variant="outline" className="flex-1">
              <CheckCircle2 className="h-4 w-4" /> Mark as Reviewed
            </Button>
            <Button className="flex-1 bg-gradient-primary text-primary-foreground hover:opacity-90">
              <CalendarPlus className="h-4 w-4" /> Schedule Follow-up
            </Button>
            {drawerActions.map(action => (
              <Button 
                key={action.action_id}
                onClick={() => handleCustomAction(action)}
                disabled={loadingAction === action.action_id}
                className={cn("flex-1", action.color_class || "bg-secondary text-foreground")}
              >
                {loadingAction === action.action_id ? "..." : action.label}
              </Button>
            ))}
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
    <div className="rounded-xl border border-border/60 bg-card/80 p-3 text-center backdrop-blur-sm">
      <div className="flex items-center justify-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        <Icon className="h-3 w-3" /> {label}
      </div>
      <p className="mt-1 truncate text-sm font-semibold text-foreground">{value}</p>
    </div>
  );
}
