import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Phone, Building2, Calendar, PhoneCall, PhoneMissed, Loader2 } from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
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
      <DashboardLayout title="Customer" breadcrumb={["Dashboard", "Customers", "Loading..."]}>
        <div className="flex items-center justify-center py-32 text-muted-foreground">
          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          Loading customer...
        </div>
      </DashboardLayout>
    );
  }

  if (!customer) {
    return (
      <DashboardLayout title="Customer" breadcrumb={["Dashboard", "Customers", "Not Found"]}>
        <div className="py-16 text-center text-muted-foreground">Customer not found.</div>
      </DashboardLayout>
    );
  }

  const totalCalls = calls.length;
  const missedCalls = calls.filter((c) => c.status?.toLowerCase() === "missed").length;
  const pickupCalls = totalCalls - missedCalls;

  return (
    <DashboardLayout
      title={customer.name}
      breadcrumb={["Dashboard", "Customers", customer.name]}
    >
      {/* Back button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => navigate("/customers")}
        className="mb-4 gap-1.5 text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Customers
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
              Since {new Date(customer.created_at).toLocaleDateString()}
            </span>
          </div>
        </div>
        <div className="flex gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-foreground">{totalCalls}</div>
            <div className="text-xs text-muted-foreground">Total Calls</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-success">{pickupCalls}</div>
            <div className="text-xs text-muted-foreground">Pickups</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-destructive">{missedCalls}</div>
            <div className="text-xs text-muted-foreground">Missed</div>
          </div>
        </div>
      </div>

      {/* Calls History */}
      <div className="rounded-2xl border border-border/70 bg-card shadow-card">
        <div className="border-b border-border/60 px-5 py-4">
          <h3 className="text-base font-semibold text-foreground">Call History</h3>
          <p className="text-xs text-muted-foreground">All calls from this customer</p>
        </div>

        {calls.length === 0 ? (
          <div className="py-16 text-center text-sm text-muted-foreground">
            No calls found for this customer.
          </div>
        ) : (
          <div className="divide-y divide-border/60">
            {calls.map((call) => {
              const isPickup = call.status?.toLowerCase() === "pickup";
              const sat = satisfactionMeta[call.satisfaction] || satisfactionMeta["None"];
              const durationStr = call.call_duration
                ? `${Math.floor(call.call_duration / 60).toString().padStart(2, "0")}:${(call.call_duration % 60).toString().padStart(2, "0")}`
                : "00:00";

              return (
                <div key={call.id} className="flex flex-wrap items-center gap-4 px-5 py-4">
                  <div className={cn("flex h-9 w-9 items-center justify-center rounded-full", isPickup ? "bg-success-soft" : "bg-[hsl(var(--destructive-soft))]")}>
                    {isPickup
                      ? <PhoneCall className="h-4 w-4 text-success" />
                      : <PhoneMissed className="h-4 w-4 text-destructive" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">{call.two_word_summary || "Call"}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(call.created_at).toLocaleString()} · {durationStr}
                    </p>
                    {call.detailed_summary && (
                      <p className="mt-1 text-xs text-muted-foreground line-clamp-2">{call.detailed_summary}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={cn("text-sm", sat.tone)}>{sat.emoji} {call.satisfaction || "—"}</span>
                    <Badge
                      className={cn(
                        "rounded-full border-transparent text-[11px] font-semibold",
                        isPickup ? "bg-success-soft text-success" : "bg-[hsl(var(--destructive-soft))] text-destructive"
                      )}
                    >
                      {call.status}
                    </Badge>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default CustomerDetail;
