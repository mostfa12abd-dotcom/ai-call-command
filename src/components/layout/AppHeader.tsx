import { Bell, Search, ChevronRight } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface AppHeaderProps {
  title: string;
  breadcrumb: string[];
}

export function AppHeader({ title, breadcrumb }: AppHeaderProps) {
  return (
    <header className="sticky top-0 z-30 flex flex-col gap-3 border-b border-border/60 bg-background/80 px-4 py-3 backdrop-blur-md md:px-6 md:py-4">
      <div className="flex items-center gap-3">
        <SidebarTrigger className="text-muted-foreground hover:text-foreground" />
        <nav className="hidden items-center gap-1.5 text-sm text-muted-foreground md:flex">
          {breadcrumb.map((crumb, i) => (
            <div key={crumb} className="flex items-center gap-1.5">
              {i > 0 && <ChevronRight className="h-3.5 w-3.5 opacity-60" />}
              <span className={i === breadcrumb.length - 1 ? "font-medium text-foreground" : ""}>
                {crumb}
              </span>
            </div>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2 md:gap-3">
          <div className="relative hidden md:block">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search calls, customers…"
              className="h-9 w-64 rounded-lg border-border bg-secondary/60 pl-9 text-sm shadow-none focus-visible:bg-background"
            />
          </div>
          <button
            type="button"
            className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            aria-label="Notifications"
          >
            <Bell className="h-4 w-4" />
            <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-destructive ring-2 ring-background" />
          </button>
          <Avatar className="h-9 w-9 ring-2 ring-background">
            <AvatarFallback className="bg-gradient-primary text-xs font-semibold text-primary-foreground">
              AM
            </AvatarFallback>
          </Avatar>
        </div>
      </div>

      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground md:text-[28px]">{title}</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Real-time analytics and insights for your AI-powered call center.
          </p>
        </div>
      </div>
    </header>
  );
}
