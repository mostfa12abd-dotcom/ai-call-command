import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Phone, Building2, Calendar, PhoneCall, PhoneMissed, Loader2 } from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { cn } from "@/lib/utils";

const palette = [
  "bg-blue-100 text-blue-700",
  "bg-emerald-100 text-emerald-700",
  "bg-amber-100 text-amber-700",
  "bg-rose-100 text-rose-700",
];

const initialsOf = (name: string) =>
  (name || "?").split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase();

const satisfactionMeta: Record<string, { emoji: string; tone: string }> = {
  High: { emoji: "😊", tone: "text-success" },
  Medium: { emoji: "😐", tone: "text-warning" },
  Low: { emoji: "😠", tone: "text-destructive" },
  None: { emoji: "—", tone: "text-muted-foreground" },
};

const CustomerDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t, dir, language } = useLanguage();
  const dateLocale = language === "ar" ? "ar-EG" : "en-GB";
  const [customer, setCustomer] = useState<any>(null);
  const [calls, setCalls] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id || !user) return;

    const fetchData = async () => {
      setLoading(true);

      // Fetch customer
      const { data: cust } = await supabase
        .from("customers")
        .select("*")
        .eq("id", id)
        .eq("tenant_id", user.id)
        .single();

      setCustomer(cust);

      // Fetch calls for this customer by name
      if (cust?.name) {
        const { data: callsData } = await supabase
          .from("calls")
          .select("*")
          .eq("tenant_id", user.id)
          .ilike("caller_name", cust.name)
          .order("created_at", { ascending: false });

        setCalls(callsData || []);
      }

      setLoading(false);
    };

    fetchData();
  }, [id, user]);

  if (loading) {
    return (
      <DashboardLayout
        title={t("customer.title")}
        breadcrumb={[t("nav.dashboard"), t("customers.title"), t("common.loading")]}
      >
        <div className="flex items-center justify-center py-32 text-muted-foreground">
          <Loader2 className={cn("h-5 w-5 animate-spin", dir === "rtl" ? "ml-2" : "mr-2")} />
          {t("customer.loading")}
        </div>
      </DashboardLayout>
    );
  }

  if (!customer) {
    return (
      <DashboardLayout
        title={t("customer.title")}
        breadcrumb={[t("nav.dashboard"), t("customers.title"), t("customer.notFound")]}
      >
        <div className="py-16 text-center text-muted-foreground">{t("customer.notFound")}</div>
      </DashboardLayout>
    );
  }

  const totalCalls = calls.length;
  const missedCalls = calls.filter((c) => c.status?.toLowerCase() === "missed").length;
  const pickupCalls = totalCalls - missedCalls;

  return (
    <DashboardLayout
      title={customer.name}
      breadcrumb={[t("nav.dashboard"), t("customers.title"), customer.name]}
    >
      {/* Back button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => navigate("/customers")}
        className="mb-4 gap-1.5 text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className={cn("h-4 w-4", dir === "rtl" ? "rotate-180" : "")} /> {t("customer.back")}
      </Button>

      {/* Profile Card */}
      <div className="mb-6 flex flex-wrap items-center gap-5 rounded-2xl border border-border/70 bg-card p-6 shadow-card">
        <Avatar className="h-16 w-16">
          <AvatarFallback className={cn("text-lg font-bold", palette[0])}>
            {initialsOf(customer.name)}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <h2 className="text-xl font-bold text-foreground">{customer.name}</h2>
          <div className="mt-1 flex flex-wrap gap-4 text-sm text-muted-foreground">
            {customer.company && (
              <span className="flex items-center gap-1.5">
                <Building2 className="h-3.5 w-3.5" /> {customer.company}
              </span>
            )}
            {customer.phone && (
              <span className="flex items-center gap-1.5">
                <Phone className="h-3.5 w-3.5" /> {customer.phone}
              </span>
            )}
            <span className="flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5" />
              {t("customer.since")} {new Date(customer.created_at).toLocaleDateString(dateLocale)}
            </span>
          </div>
        </div>
        <div className="flex gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-foreground">{totalCalls}</div>
            <div className="text-xs text-muted-foreground">{t("customer.stat.total")}</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-success">{pickupCalls}</div>
            <div className="text-xs text-muted-foreground">{t("customer.stat.pickups")}</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-destructive">{missedCalls}</div>
            <div className="text-xs text-muted-foreground">{t("customer.stat.missed")}</div>
          </div>
        </div>
      </div>

      {/* Calls History */}
      <div className="space-y-6">
        {calls.length === 0 ? (
          <div className="rounded-2xl border border-border/70 bg-card p-16 text-center text-sm text-muted-foreground shadow-card">
            {t("customer.empty")}
          </div>
        ) : (
          calls.map((call) => {
            const isPickup = call.status?.toLowerCase() === "pickup" || call.status?.toLowerCase() === "completed";
            const durationStr = call.call_duration
              ? `${Math.floor(call.call_duration / 60).toString().padStart(2, "0")}:${(call.call_duration % 60).toString().padStart(2, "0")}`
              : "00:00";
            
            const appointment = call.custom_data?.appointment || call.custom_data?.appointment_date || "—";

            return (
              <div key={call.id} className="overflow-hidden rounded-2xl border border-border/70 bg-card shadow-card">
                <div className="border-b border-border/60 bg-secondary/30 px-6 py-4 flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-bold text-foreground">{call.two_word_summary || "Call Summary"}</h3>
                    <p className="text-xs text-muted-foreground">
                      {new Date(call.created_at).toLocaleString(dateLocale)} · {durationStr}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="bg-background/50 font-mono text-[11px]">
                      {call.status}
                    </Badge>
                    {appointment !== "—" && (
                      <Badge className="bg-primary/10 text-primary hover:bg-primary/20 border-primary/20 text-[11px]">
                        📅 {appointment}
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="p-6 space-y-6">
                  {/* Detailed Summary */}
                  <div>
                    <h4 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                      📝 {t("dashboard.drawer.summary")}
                    </h4>
                    <p className="text-sm text-muted-foreground leading-relaxed bg-secondary/20 p-4 rounded-xl border border-border/40">
                      {call.detailed_summary || "No detailed summary available."}
                    </p>
                  </div>

                  {/* Recording */}
                  {call.recording_url && (
                    <div>
                      <h4 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                        🎙️ {t("dashboard.drawer.recording")}
                      </h4>
                      <audio controls className="w-full h-10 rounded-lg">
                        <source src={call.recording_url} type="audio/mpeg" />
                        Your browser does not support the audio element.
                      </audio>
                    </div>
                  )}

                  {/* Conversation */}
                  {call.total_conversation && (
                    <div>
                      <h4 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                        💬 {t("dashboard.drawer.transcript")}
                      </h4>
                      <div className="max-h-[300px] overflow-y-auto rounded-xl border border-border/40 bg-secondary/10 p-4">
                        <div className="space-y-4">
                          {call.total_conversation.split('\n').filter(line => line.trim()).map((line, idx) => {
                            const isAI = line.startsWith('AI:');
                            return (
                              <div key={idx} className={cn("flex flex-col", isAI ? "items-start" : "items-end")}>
                                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1 px-1">
                                  {isAI ? "AI Assistant" : "Customer"}
                                </span>
                                <div className={cn(
                                  "max-w-[85%] rounded-2xl px-4 py-2.5 text-sm shadow-sm",
                                  isAI 
                                    ? "bg-white text-slate-800 rounded-tl-none border border-slate-100" 
                                    : "bg-primary text-primary-foreground rounded-tr-none"
                                )}>
                                  {line.replace(/^(AI|User|Customer):/, '').trim()}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </DashboardLayout>
  );
};

export default CustomerDetail;
