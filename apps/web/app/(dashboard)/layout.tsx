import type { ReactNode } from "react";

import { DashboardAuthGuard } from "~/components/dashboard-auth-guard";
import { DashboardSidebar } from "~/components/dashboard-sidebar";
import { DashboardHeader } from "~/components/dashboard-header";
import { DashboardContentShell } from "~/components/dashboard-content-shell";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <DashboardAuthGuard>
      <div className="flex h-screen overflow-hidden bg-[#0b0c0d] text-foreground">
        <DashboardSidebar />
        <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
          <div className="sticky top-0 z-10 bg-[#0b0c0d] border-b border-border">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
              <DashboardHeader />
            </div>
          </div>

          <DashboardContentShell>{children}</DashboardContentShell>
        </div>
      </div>
    </DashboardAuthGuard>
  );
}
