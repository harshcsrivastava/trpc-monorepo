"use client";

import Image from "next/image";
import { toast } from "sonner";

const DEFAULT_ERROR_MESSAGE = "Something went wrong.";

export function showGlobalErrorToast(error: unknown) {
  const message = error instanceof Error ? error.message : DEFAULT_ERROR_MESSAGE;

  toast.custom(
    (id) => (
      <div className="flex w-90 items-center gap-4 rounded-2xl border border-white/15 bg-[#111111] px-4 py-3 text-white shadow-[0_16px_48px_rgba(0,0,0,0.45)]">
        <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl border border-white/10 bg-[#1a1a1a]">
          <Image
            src="/dashboard/block.png"
            alt="Notification"
            fill
            sizes="56px"
            className="object-cover"
          />
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-[11px] uppercase tracking-[0.22em] text-red-400">Error Message</p>
          <p className="mt-1 wrap-break-word text-sm text-white/90">{message}</p>
        </div>

        <button
          type="button"
          onClick={() => toast.dismiss(id)}
          className="text-2xl leading-none text-white/80 transition hover:text-white"
          aria-label="Dismiss notification"
        >
          ×
        </button>
      </div>
    ),
    { duration: 5000 }
  );
}