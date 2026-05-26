"use client";

import { type ReactNode, useEffect } from "react";
import { useRouter } from "next/navigation";

import { useUser } from "~/hooks/api/auth";

export function DashboardAuthGuard({ children }: { children: ReactNode }) {
  const { user, isFetched, isFetching } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (isFetched && !user?.id) {
      router.replace("/login");
    }
  }, [isFetched, router, user?.id]);

  if (!isFetched || isFetching || !user?.id) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0b0c0d] text-muted-foreground text-3xl uppercase tracking-[0.12em] ">
        Protected Route. Redirecting...
      </div>
    );
  }

  return <>{children}</>;
}
