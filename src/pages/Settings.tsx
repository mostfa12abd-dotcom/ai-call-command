import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Copy, RefreshCw, Save, Eye, EyeOff, Languages, Check, Sun, Moon, Monitor, LogOut, User } from "lucide-react";
import { useTheme } from "next-themes";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

const columnDefaults = [
  { key: "caller", label: "Caller", on: true },
  { key: "company", label: "Company", on: true },
  { key: "duration", label: "Call Duration", on: true },
  { key: "status", label: "Status", on: true },
  { key: "satisfaction", label: "Satisfaction", on: true },
  { key: "summary", label: "Two-Word Summary", on: true },
  { key: "phone", label: "Phone Number", on: false },
  { key: "tags", label: "Tags", on: false },
];

const Settings = () => {
  const { toast } = useToast();
  const { language, setLanguage } = useLanguage();
  const { theme, setTheme } = useTheme();
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [columns, setColumns] = useState(columnDefaults);
  const [showKey, setShowKey] = useState(false);
  const apiKey = "vx_live_9f3a7c2e8b1d4f5a6c9e2b8a1d4f7c3e";

  const handleLogout = async () => {
    await signOut();
    navigate("/login");
  };

  const handleSave = () =>
    toast({ title: "Settings saved", description: "Your changes are now live." });

  const handleCopy = () => {
    navigator.clipboard.writeText(apiKey);
    toast({ title: "API key copied" });
  };

  return (
    <DashboardLayout
      title="Settings"
      breadcrumb={["Dashboard", "AI Voice Call Center", "Settings"]}
    >
      <Tabs defaultValue="account" className="space-y-6">
        <TabsList className="h-auto flex-wrap rounded-xl border border-border/70 bg-card p-1 shadow-card">
          <TabsTrigger value="account" className="rounded-lg px-4 text-sm">Account</TabsTrigger>
          <TabsTrigger value="appearance" className="rounded-lg px-4 text-sm">Appearance</TabsTrigger>
          <TabsTrigger value="language" className="rounded-lg px-4 text-sm">Language</TabsTrigger>
        </TabsList>

        <TabsContent value="account">
          <div className="rounded-2xl border border-border/70 bg-card p-6 shadow-card">
            <div className="mb-5 flex items-center gap-2">
              <User className="h-5 w-5 text-muted-foreground" />
              <div>
                <h3 className="text-base font-semibold tracking-tight">Account</h3>
                <p className="text-xs text-muted-foreground">Manage your signed-in account.</p>
              </div>
            </div>

            <div className="flex items-center gap-4 rounded-xl border border-border/60 bg-secondary/30 p-4">
              <Avatar className="h-12 w-12 rounded-lg border border-border">
                <AvatarFallback className="rounded-lg bg-gradient-primary text-sm font-semibold text-primary-foreground">
                  {user?.email?.substring(0, 2).toUpperCase() || "US"}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-foreground">Signed in as</p>
                <p className="truncate text-xs text-muted-foreground">{user?.email || "user@example.com"}</p>
              </div>
              <Button variant="outline" onClick={handleLogout} className="gap-1.5 text-destructive hover:text-destructive">
                <LogOut className="h-4 w-4" /> Log out
              </Button>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="appearance">
          <div className="rounded-2xl border border-border/70 bg-card p-6 shadow-card">
            <div className="mb-5">
              <h3 className="text-base font-semibold tracking-tight">Appearance</h3>
              <p className="text-xs text-muted-foreground">Choose how the dashboard looks to you.</p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              {[
                { value: "light", label: "Light", icon: Sun },
                { value: "dark", label: "Dark", icon: Moon },
                { value: "system", label: "System", icon: Monitor },
              ].map((opt) => {
                const Icon = opt.icon;
                const active = theme === opt.value;
                return (
                  <button
                    key={opt.value}
                    onClick={() => setTheme(opt.value)}
                    className={cn(
                      "flex items-center justify-between rounded-xl border p-4 text-left transition-all",
                      active
                        ? "border-primary bg-primary/5 shadow-sm"
                        : "border-border hover:border-primary/50 hover:bg-secondary/40"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="h-5 w-5 text-muted-foreground" />
                      <span className="text-sm font-semibold text-foreground">{opt.label}</span>
                    </div>
                    {active && (
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground">
                        <Check className="h-3.5 w-3.5" />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="language">
          <div className="rounded-2xl border border-border/70 bg-card p-6 shadow-card">
            <div className="mb-5 flex items-center gap-2">
              <Languages className="h-5 w-5 text-muted-foreground" />
              <div>
                <h3 className="text-base font-semibold tracking-tight">Language / اللغة</h3>
                <p className="text-xs text-muted-foreground">
                  Choose your preferred language. اختر لغتك المفضلة.
                </p>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {[
                { code: "en" as const, label: "English", sub: "Left to right" },
                { code: "ar" as const, label: "العربية", sub: "من اليمين إلى اليسار" },
              ].map((opt) => {
                const active = language === opt.code;
                return (
                  <button
                    key={opt.code}
                    onClick={() => {
                      setLanguage(opt.code);
                      toast({ title: opt.code === "ar" ? "تم تغيير اللغة" : "Language changed" });
                    }}
                    className={cn(
                      "group relative flex items-center justify-between rounded-xl border p-4 text-left transition-all",
                      active
                        ? "border-primary bg-primary/5 shadow-sm"
                        : "border-border hover:border-primary/50 hover:bg-secondary/40"
                    )}
                  >
                    <div>
                      <p className="text-base font-semibold text-foreground">{opt.label}</p>
                      <p className="text-xs text-muted-foreground">{opt.sub}</p>
                    </div>
                    {active && (
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground">
                        <Check className="h-3.5 w-3.5" />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
};

export default Settings;
