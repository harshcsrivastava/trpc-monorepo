"use client";
import { Search } from "lucide-react";
export function DashboardHeader({ title = "Overview" }: { title?: string }) {
  return (
    <header className="flex items-center justify-between gap-4 mb-6">
      <div>
        <h2 className="text-[18px] text-foreground font-black tracking-[0.08em] uppercase">
          {title}
        </h2>
        <p className="text-[12px] text-muted-foreground uppercase tracking-[0.12em] mt-1">
          Manage your forms and responses
        </p>
      </div>

      <div className="flex items-center gap-3 shrink-0">
        <div className="relative">
          <input
            placeholder="Search forms..."
            className="h-10 w-60 px-4 rounded-lg bg-[#ededed] text-sm font-black tracking-[0.08em] uppercase placeholder:text-[#8a8a8a] placeholder:font-black"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 opacity-60 text-xs px-2 font-black">
            {" "}
            <Search strokeWidth={3} />
          </div>
        </div>

        {/* <button className="h-10 px-4 rounded-lg bg-[#14b84d] text-white text-sm flex items-center gap-2 font-black tracking-[0.08em] uppercase shadow-[inset_0_1px_0_rgba(255,255,255,0.18)]">
          <span className="text-sm">+ Create Form</span>
        </button> */}

        <button className="h-10 w-10 rounded-lg border border-[#373737] bg-[#111314] text-white flex items-center justify-center font-black">
          ?
        </button>
      </div>
    </header>
  );
}
