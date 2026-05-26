"use client";

import Image from "next/image";
import { Form, Rss, Link, ChartNoAxesColumn } from "lucide-react";
import { useRouter } from "next/navigation";

const summary = [
  { title: "Total Forms", value: 12 },
  { title: "Published", value: 7 },
  { title: "Unlisted", value: 3 },
  { title: "Total Responses", value: "1,248" },
];

const forms = [
  {
    title: "Minecraft Server Feedback",
    subtitle: "Help us improve your server experience",
    responses: 342,
    status: "Published",
    visibility: "Public",
    updated: "May 20, 2025",
    img: "/dashboard/bg/image-2.png",
  },
  {
    title: "Event Registration Form",
    subtitle: "Register for our upcoming Minecraft event",
    responses: 156,
    status: "Published",
    visibility: "Unlisted",
    updated: "May 18, 2025",
    img: "/dashboard/bg/image-1.png",
  },
  {
    title: "Build Contest Submission",
    subtitle: "Submit your amazing builds",
    responses: 98,
    status: "Published",
    visibility: "Public",
    updated: "May 15, 2025",
    img: "/dashboard/bg/image-3.png",
  },
];

export default function Page() {
  const router = useRouter();

  const handleClick = () => {
    router.replace("/forms");
  };
  return (
    <div className="w-full pb-6">
      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {summary.map((s) => (
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

      {/* Forms list */}
      <div className="bg-[#0f1113] border border-[#626262] rounded-2xl overflow-hidden">
        <div className="px-6 py-5 border-b border-[#626262] flex items-center justify-between">
          <div>
            <h3 className="text-[18px] font-black tracking-[0.08em] uppercase">Your Forms</h3>
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
          {forms.map((f) => (
            <div
              key={f.title}
              className="px-6 py-4 grid grid-cols-24 gap-4 items-center border-b border-[#626262] hover:bg-[#0b0d0e] min-h-20"
            >
              {/* FORM */}
              <div className="col-span-12 flex items-center gap-4">
                <div className="w-20 h-14 bg-cover bg-center rounded-lg overflow-hidden shrink-0">
                  <Image src={f.img} alt={f.title} width={160} height={96} />
                </div>
                <div>
                  <div className="text-[14px] font-black tracking-[0.06em] uppercase">
                    {f.title}
                  </div>
                  <div className="text-[12px] text-muted-foreground mt-1">{f.subtitle}</div>
                </div>
              </div>

              {/* RESPONSES */}
              <div className="m-auto col-span-2 text-center font-black text-[16px] flex items-center justify-center gap-2">
                {f.responses}
                <Image
                  src="/next.svg"
                  alt="response icon"
                  width={16}
                  height={16}
                  className="w-4 h-4 opacity-50"
                />
              </div>

              {/* STATUS */}
              <div className="col-span-3 m-auto">
                <span className="px-3 py-1 rounded-full bg-[#0f8b2f] text-white text-[11px] font-black tracking-[0.08em] uppercase">
                  {f.status}
                </span>
              </div>

              {/* VISIBILITY */}
              <div className="col-span-2 text-[12px] m-auto font-black tracking-[0.08em] uppercase text-[#bdbdbd]">
                {f.visibility}
              </div>

              {/* UPDATED */}
              <div className="m-auto col-span-2 text-[12px] text-[#bdbdbd]">{f.updated}</div>

              {/* ACTIONS */}
              <div className="col-span-3 text-right m-auto">
                <button className="h-10 px-4 rounded-lg border border-[#626262] bg-[#0b0d0e] text-[13px] font-black tracking-[0.08em] uppercase">
                  Edit
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="px-6 py-4 flex items-center justify-between text-[12px] text-[#9b9b9b]">
          <div>Showing 1 to 5 of 12 forms</div>
          <div className="flex items-center gap-2">
            <button className="w-10 h-10 rounded-[6px] border border-[#626262] bg-[#0b0d0e]">
              ‹
            </button>
            <button className="w-10 h-10 rounded-[6px] border border-[#2c6f25] bg-[#122312] text-white">
              1
            </button>
            <button className="w-10 h-10 rounded-[6px] border border-[#626262] bg-[#0b0d0e]">
              2
            </button>
            <button className="w-10 h-10 rounded-[6px] border border-[#626262] bg-[#0b0d0e]">
              3
            </button>
            <button className="w-10 h-10 rounded-[6px] border border-[#626262] bg-[#0b0d0e]">
              ›
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
