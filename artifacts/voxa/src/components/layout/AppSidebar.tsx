import {
  LayoutDashboard,
  Users,
  FolderKanban,
  CheckSquare,
  Target,
  TrendingUp,
  ShoppingCart,
  Workflow,
  Sparkles,
  PhoneCall,
  FileText,
  Contact,
  LifeBuoy,
  UsersRound,
  BarChart3,
  Settings,
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { useLanguage } from "@/contexts/LanguageContext";
import type { TranslationKey } from "@/i18n/translations";

const mainItems: Array<{
  titleKey: TranslationKey;
  url: string;
  icon: typeof LayoutDashboard;
  exact?: boolean;
}> = [
  { titleKey: "nav.dashboard", url: "/dashboard", icon: LayoutDashboard, exact: true },
  { titleKey: "nav.customers", url: "/customers", icon: Users },
  { titleKey: "nav.settings", url: "/settings", icon: Settings },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const { t, dir } = useLanguage();
  const collapsed = state === "collapsed";
  const isRtl = dir === "rtl";

  const linkClass = collapsed
    ? "flex h-10 w-10 items-center justify-center rounded-xl text-sidebar-foreground/80 transition-all hover:bg-sidebar-accent hover:text-sidebar-accent-foreground mx-auto"
    : "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-sidebar-foreground/80 transition-all hover:bg-sidebar-accent hover:text-sidebar-accent-foreground";
  const activeClass = "bg-sidebar-accent text-sidebar-accent-foreground font-semibold";

  return (
    <Sidebar
      side={isRtl ? "right" : "left"}
      collapsible="icon"
      className={isRtl ? "border-l border-sidebar-border" : "border-r border-sidebar-border"}
    >
      <SidebarHeader className="border-b border-sidebar-border px-4 py-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-primary shadow-card">
            <PhoneCall className="h-4.5 w-4.5 text-primary-foreground" strokeWidth={2.5} />
          </div>
          {!collapsed && (
            <div className="flex flex-col leading-tight">
              <span className="text-base font-bold tracking-tight text-foreground">Voxa</span>
              <span className="text-[11px] text-muted-foreground">{t("brand.tagline")}</span>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className={collapsed ? "px-1.5 py-3" : "px-2 py-3"}>
        <SidebarGroup>
          {!collapsed && (
            <SidebarGroupLabel className="px-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              {t("nav.workspace")}
            </SidebarGroupLabel>
          )}
          <SidebarGroupContent>
            <SidebarMenu>
              {mainItems.map((item) => {
                const label = t(item.titleKey);
                return (
                  <SidebarMenuItem key={item.titleKey}>
                    <SidebarMenuButton
                      asChild
                      tooltip={collapsed ? label : undefined}
                      className={collapsed ? "h-10 p-0 hover:bg-transparent" : "h-auto p-0 hover:bg-transparent"}
                    >
                      <NavLink
                        to={item.url}
                        end={item.exact}
                        className={linkClass}
                        activeClassName={activeClass}
                      >
                        <item.icon className="h-[18px] w-[18px] shrink-0" />
                        {!collapsed && (
                          <span className="flex-1 truncate">{label}</span>
                        )}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>


      </SidebarContent>
    </Sidebar>
  );
}
