"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";

export function DashboardContentShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isFormEditor = /^\/forms\/[^/]+$/.test(pathname ?? "");

  return (
    <main className="relative min-h-0 flex-1 overflow-hidden py-6">
      {isFormEditor ? (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-cover bg-center bg-no-repeat blur-xl opacity-45 scale-110"
          style={{ backgroundImage: "url('/dashboard/bg-edit-form.png')" }}
        />
      ) : null}

      <div className="relative h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {children}
      </div>
    </main>
  );
}