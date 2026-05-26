import type { ReactNode } from "react";

import { DashboardAuthGuard } from "~/components/dashboard-auth-guard";
import { DashboardSidebar } from "~/components/dashboard-sidebar";
import { DashboardHeader } from "~/components/dashboard-header";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <DashboardAuthGuard>
      <div className="min-h-screen flex bg-[#0b0c0d] text-foreground">
        <DashboardSidebar />
        <div className="flex-1">
          <div className="sticky top-0 z-10 bg-[#0b0c0d] border-b border-border">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
              <DashboardHeader />
            </div>
          </div>

          <main className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">{children}</div>
          </main>
        </div>
      </div>
    </DashboardAuthGuard>
  );
}
