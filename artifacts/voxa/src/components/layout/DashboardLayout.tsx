import { ReactNode } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { AppHeader } from "./AppHeader";

interface DashboardLayoutProps {
  title: string;
  breadcrumb: string[];
  children: ReactNode;
}

export function DashboardLayout({ title, breadcrumb, children }: DashboardLayoutProps) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">
        <AppSidebar />
        <div className="flex min-w-0 flex-1 flex-col">
          <AppHeader title={title} breadcrumb={breadcrumb} />
          <main className="flex-1 px-4 py-6 md:px-6 md:py-8 animate-fade-in">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
}
