import { useState } from "react";
import { Copy, RefreshCw, Save, Eye, EyeOff } from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";

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
  const [columns, setColumns] = useState(columnDefaults);
  const [showKey, setShowKey] = useState(false);
  const apiKey = "vx_live_9f3a7c2e8b1d4f5a6c9e2b8a1d4f7c3e";

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
      <Tabs defaultValue="business" className="space-y-6">
        <TabsList className="h-10 rounded-xl border border-border/70 bg-card p-1 shadow-card">
          <TabsTrigger value="business" className="rounded-lg px-4 text-sm">Business Info</TabsTrigger>
          <TabsTrigger value="columns" className="rounded-lg px-4 text-sm">Dashboard Columns</TabsTrigger>
          <TabsTrigger value="api" className="rounded-lg px-4 text-sm">API Keys</TabsTrigger>
        </TabsList>

        <TabsContent value="business">
          <div className="rounded-2xl border border-border/70 bg-card p-6 shadow-card">
            <div className="mb-5">
              <h3 className="text-base font-semibold tracking-tight">Business Information</h3>
              <p className="text-xs text-muted-foreground">Used across your dashboard, invoices, and call routing.</p>
            </div>
            <div className="grid gap-5 md:grid-cols-2">
              <Field label="Company Name" defaultValue="Voxa Labs Inc." />
              <Field label="Contact Email" type="email" defaultValue="ops@voxa.app" />
              <Field label="Phone Number" defaultValue="+1 (415) 555-0100" />
              <div>
                <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Timezone
                </Label>
                <select className="mt-1.5 flex h-10 w-full rounded-lg border border-input bg-background px-3 text-sm">
                  <option>America/Los_Angeles</option>
                  <option>America/New_York</option>
                  <option>Europe/London</option>
                  <option>Asia/Tokyo</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Logo
                </Label>
                <div className="mt-1.5 flex items-center gap-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-gradient-primary text-lg font-bold text-primary-foreground shadow-card">
                    V
                  </div>
                  <Button variant="outline" size="sm">Upload new logo</Button>
                </div>
              </div>
            </div>
            <div className="mt-6 flex justify-end">
              <Button onClick={handleSave} className="gap-1.5 bg-gradient-primary text-primary-foreground hover:opacity-90">
                <Save className="h-4 w-4" /> Save changes
              </Button>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="columns">
          <div className="rounded-2xl border border-border/70 bg-card p-6 shadow-card">
            <div className="mb-5">
              <h3 className="text-base font-semibold tracking-tight">Dashboard Columns</h3>
              <p className="text-xs text-muted-foreground">
                Toggle which columns appear in the Recent Calls table. Custom fields are stored per workspace.
              </p>
            </div>
            <div className="divide-y divide-border/60">
              {columns.map((col) => (
                <div key={col.key} className="flex items-center justify-between py-3.5">
                  <div>
                    <p className="text-sm font-medium text-foreground">{col.label}</p>
                    <p className="text-xs text-muted-foreground">Field key: {col.key}</p>
                  </div>
                  <Switch
                    checked={col.on}
                    onCheckedChange={(checked) =>
                      setColumns((prev) =>
                        prev.map((c) => (c.key === col.key ? { ...c, on: checked } : c)),
                      )
                    }
                  />
                </div>
              ))}
            </div>
            <div className="mt-6 flex justify-end">
              <Button onClick={handleSave} className="gap-1.5 bg-gradient-primary text-primary-foreground hover:opacity-90">
                <Save className="h-4 w-4" /> Save changes
              </Button>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="api">
          <div className="rounded-2xl border border-border/70 bg-card p-6 shadow-card">
            <div className="mb-5">
              <h3 className="text-base font-semibold tracking-tight">API Keys</h3>
              <p className="text-xs text-muted-foreground">
                Use these keys to integrate Voxa with your CRM, Zapier, or custom apps.
              </p>
            </div>
            <div className="space-y-4">
              <div>
                <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Live Key
                </Label>
                <div className="mt-1.5 flex gap-2">
                  <div className="flex h-10 flex-1 items-center rounded-lg border border-input bg-secondary/60 px-3 font-mono text-sm">
                    {showKey ? apiKey : "•".repeat(36)}
                  </div>
                  <Button variant="outline" size="icon" onClick={() => setShowKey((s) => !s)}>
                    {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                  <Button variant="outline" size="icon" onClick={handleCopy}>
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" className="gap-1.5">
                    <RefreshCw className="h-4 w-4" /> Regenerate
                  </Button>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                Keep this secret. Regenerating will invalidate the old key immediately.
              </p>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
};

function Field({
  label,
  defaultValue,
  type = "text",
}: {
  label: string;
  defaultValue: string;
  type?: string;
}) {
  return (
    <div>
      <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </Label>
      <Input type={type} defaultValue={defaultValue} className="mt-1.5" />
    </div>
  );
}

export default Settings;
