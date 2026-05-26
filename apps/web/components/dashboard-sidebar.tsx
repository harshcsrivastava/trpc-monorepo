"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useUser } from "~/hooks/api/auth";

export function DashboardSidebar() {
  const { user } = useUser();
  const pathname = usePathname();
  const isOverviewActive = pathname === "/dashboard" || pathname?.startsWith("/dashboard/");
  const isFormsActive = pathname === "/forms" || pathname?.startsWith("/forms/");
  return (
    <aside
      className="w-62 min-h-screen border-r border-[#2c2c2c] p-3 flex flex-col"
      style={{
        backgroundImage: `url('/sidebar-image.png')`,
        backgroundSize: "cover",
        backgroundPosition: "left",
        backgroundRepeat: "no-repeat",
      }}
    >
      {/* Placeholder for creeper image or video - replace src/path manually */}
      <div className="mb-5 px-1 pt-1">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-md overflow-hidden bg-[#18c05e] flex items-center justify-center shrink-0">
            <Image
              id="icon"
              src="/dashboard/block.png"
              alt="icon"
              width={48}
              height={48}
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <div className="text-[13px] leading-none text-muted-foreground tracking-[0.18em] font-black uppercase">
              Minecraft
            </div>
            <div className="text-[12px] leading-none text-muted-foreground tracking-[0.18em] font-black uppercase mt-1 opacity-70">
              Form Builder
            </div>
          </div>
        </div>

        {/*
          If you prefer a video, replace the img tag above with this tag and set the path manually:
          <video id="creeper-video" src="/videos/creeper.mp4" muted loop playsInline className="w-full h-full object-cover" />
        */}
      </div>

      <nav className="flex-1">
        <ul className="space-y-3 mt-1">
          <li>
            <Link
              href="/dashboard"
              className={`flex items-center gap-3 px-4 py-3 rounded-[6px] ${
                isOverviewActive
                  ? "bg-[#2a3b35] text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.02)]"
                  : "hover:bg-card/40 text-muted-foreground/90"
              }`}
              aria-current={isOverviewActive ? "page" : undefined}
            >
              <span className="ml-0.5 text-[15px] font-black tracking-[0.08em] uppercase">
                Overview
              </span>
            </Link>
          </li>
          <li>
            <Link
              href="/forms"
              className={`flex items-center gap-3 px-4 py-3 rounded-[6px] ${
                isFormsActive
                  ? "bg-[#2a3b35] text-white"
                  : "hover:bg-card/40 text-muted-foreground/90"
              }`}
              aria-current={isFormsActive ? "page" : undefined}
            >
              <span className="text-[15px] font-black tracking-[0.08em] uppercase">Forms</span>
            </Link>
          </li>
        </ul>
      </nav>

      {/* User Area */}
      <div id="user-area" className="mt-auto pt-4 border-t border-[#2c2c2c] bg-[#0f1113]">
        <div className="flex items-center gap-3 px-1">
          <div className="w-10 h-10 rounded-md bg-[#0b0d0e] overflow-hidden flex items-center justify-center">
            <Image
              id="user-avatar-image"
              src={user?.profileImageUrl ?? `/dashboard/avatar-image.png`}
              alt="User avatar"
              width={40}
              height={40}
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <div className="text-sm font-black tracking-[0.08em] uppercase">{user?.fullName}</div>
            <div className="text-[11px] text-muted-foreground uppercase tracking-[0.12em]">
              {user?.email}
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
