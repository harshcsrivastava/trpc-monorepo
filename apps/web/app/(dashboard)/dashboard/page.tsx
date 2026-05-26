"use client";

import { useState } from "react";
import { Form, Rss, Link, ChartNoAxesColumn } from "lucide-react";
import { useRouter } from "next/navigation";
import { useGetForm } from "~/hooks/api/form";
import FormList from "~/components/FormList";

export default function Page() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const pageSize = 3;

  const { formsDataById, isLoading, isFetching } = useGetForm({ pageSize, page });
  const forms = formsDataById?.forms ?? [];
  const totalCount = formsDataById?.metaData.totalCount ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const start = formsDataById?.metaData.start ?? 0;
  const end = formsDataById?.metaData.end ?? 0;
  const visiblePages = Array.from({ length: totalPages }, (_, index) => index + 1);

  const totalResponses = forms.reduce((sum, form) => sum + (form.responseCount ?? 0), 0);
  const publishedCount = forms.filter(
    (form) => String(form.visibility).toLowerCase() === "public",
  ).length;
  const unlistedCount = forms.filter(
    (form) => String(form.visibility).toLowerCase() === "unlisted",
  ).length;

  const handleClick = () => {
    router.replace("/forms");
  };

  return (
    <div className="w-full pb-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {[
          { title: "Total Forms", value: totalCount },
          { title: "Published", value: publishedCount },
          { title: "Unlisted", value: unlistedCount },
          { title: "Total Responses", value: totalResponses.toLocaleString() },
        ].map((s) => (
          <div
            key={s.title}
            className="bg-[#111214] border border-[#626262] rounded-2xl p-4 min-h-24 flex items-start justify-between"
          >
            <div className="pt-1">
              <div className="text-[12px] font-black tracking-[0.12em] uppercase text-[#8c8c8c]">
                {s.title}
              </div>
              <div className="text-[22px] font-black mt-3 tracking-[0.04em]">{s.value}</div>
            </div>
            <div className="w-11 h-11 rounded-xl bg-[#161819] flex items-center justify-center shrink-0 border border-[#282828] mt-1">
              {s.title === "Total Forms" ? <Form /> : ""}
              {s.title === "Published" ? <Rss /> : ""}
              {s.title === "Unlisted" ? <Link color="yellow" /> : ""}
              {s.title === "Total Responses" ? (
                <ChartNoAxesColumn strokeWidth={3} color="#FD21E9" />
              ) : (
                ""
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="bg-[#0f1113] border border-[#626262] rounded-2xl overflow-hidden">
        <div className="px-6 py-5 border-b border-[#626262] flex items-center justify-between">
          <div>
            <h3 className="text-[18px] font-black tracking-[0.08em] uppercase">
              Your Last 3 Forms
            </h3>
            <div className="text-[12px] text-muted-foreground uppercase tracking-[0.12em] mt-1">
              All forms you&apos;ve created
            </div>
          </div>
          <div className="flex items-center gap-3">
            <select className="h-10 bg-[#ededed] px-3 rounded-lg text-sm font-black tracking-[0.08em] uppercase">
              <option>All Forms</option>
            </select>
            <button
              onClick={handleClick}
              className="h-10 px-4 rounded-lg bg-[#14b84d] text-white font-black tracking-[0.08em] uppercase shadow-[inset_0_1px_0_rgba(255,255,255,0.18)]"
            >
              + Create Form
            </button>
          </div>
        </div>

        <div className="px-6 py-3 text-[12px] font-black tracking-[0.12em] uppercase text-[#7d7d7d] grid grid-cols-24 gap-4 place-items-center border-b border-[#626262]">
          <div className="col-span-12">Form</div>
          <div className="col-span-2 text-center">Responses</div>
          <div className="col-span-3">Status</div>
          <div className="col-span-2">Visibility</div>
          <div className="col-span-2">Updated</div>
          <div className="col-span-3 text-right">Actions</div>
        </div>

        <div>
          {(isLoading || isFetching) && (
            <div className="px-6 py-4 text-sm text-muted-foreground">Loading forms...</div>
          )}
          {!isLoading && forms.length === 0 && (
            <div className="px-6 py-8 text-sm text-muted-foreground">No forms found.</div>
          )}
          {!isLoading && <FormList forms={forms} />}
        </div>

        <div className="px-6 py-4 flex items-center justify-between text-[12px] text-[#9b9b9b]">
          <div>
            Showing {start} to {end} of {totalCount} forms
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((currentPage) => Math.max(1, currentPage - 1))}
              className="w-10 h-10 rounded-[6px] border border-[#626262] bg-[#0b0d0e] disabled:opacity-50"
            >
              ‹
            </button>
            {visiblePages.map((pageNumber) => (
              <button
                key={pageNumber}
                type="button"
                onClick={() => setPage(pageNumber)}
                aria-current={pageNumber === page ? "page" : undefined}
                className={`w-10 h-10 rounded-[6px] border ${
                  pageNumber === page
                    ? "border-[#2c6f25] bg-[#122312] text-white"
                    : "border-[#626262] bg-[#0b0d0e]"
                }`}
              >
                {pageNumber}
              </button>
            ))}
            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => setPage((currentPage) => Math.min(totalPages, currentPage + 1))}
              className="w-10 h-10 rounded-[6px] border border-[#626262] bg-[#0b0d0e] disabled:opacity-50"
            >
              ›
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
