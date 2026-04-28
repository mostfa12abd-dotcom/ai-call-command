import { ChevronRight, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ModeToggle } from "@/components/ui/ModeToggle";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/contexts/AuthContext";

interface AppHeaderProps {
  title: string;
  breadcrumb: string[];
}

export function AppHeader({ title, breadcrumb }: AppHeaderProps) {
  const { signOut, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    navigate("/login");
  };

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
          <ModeToggle />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="rounded-lg outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
                <Avatar className="h-9 w-9 rounded-lg border border-border cursor-pointer transition-opacity hover:opacity-80">
                  <AvatarFallback className="rounded-lg bg-gradient-primary text-xs font-semibold text-primary-foreground">
                    {user?.email?.substring(0, 2).toUpperCase() || "US"}
                  </AvatarFallback>
                </Avatar>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">Account</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user?.email || "user@example.com"}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:bg-destructive/10 focus:text-destructive cursor-pointer">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
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
