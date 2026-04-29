import { ChevronRight } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useLanguage } from "@/contexts/LanguageContext";

interface AppHeaderProps {
  title: string;
  breadcrumb: string[];
}

export function AppHeader({ title, breadcrumb }: AppHeaderProps) {
  const { t, dir } = useLanguage();
  return (
    <header className="sticky top-0 z-30 flex flex-col gap-3 border-b border-border/60 bg-background/80 px-4 py-3 backdrop-blur-md md:px-6 md:py-4">
      <div className="flex items-center gap-3">
        <SidebarTrigger className="text-muted-foreground hover:text-foreground" />
        <nav className="hidden items-center gap-1.5 text-sm text-muted-foreground md:flex">
          {breadcrumb.map((crumb, i) => (
            <div key={crumb} className="flex items-center gap-1.5">
              {i > 0 && (
                <ChevronRight
                  className={`h-3.5 w-3.5 opacity-60 ${dir === "rtl" ? "rotate-180" : ""}`}
                />
              )}
              <span className={i === breadcrumb.length - 1 ? "font-medium text-foreground" : ""}>
                {crumb}
              </span>
            </div>
          ))}
        </nav>
      </div>

      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground md:text-[28px]">{title}</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">{t("header.subtitle")}</p>
        </div>
      </div>
    </header>
  );
}
