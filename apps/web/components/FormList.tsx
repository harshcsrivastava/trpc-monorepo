import React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

type Forms = {
  formId: string;
  creatorName: string;
  formTitle: string;
  formDescription: string | null;
  responseCount: number;
  visibility: string;
  slug?: string;
  updatedAt: string;
  count: number;
};

type FormListProps = {
  forms: Forms[];
};

const FormList = ({ forms }: FormListProps) => {
  const router = useRouter();
  const handleEdit = (id: string) => {
    router.replace(`/forms/${id}`);
  };
  return (
    <>
      {forms.map((form, index) => {
        const imgIndex = (index % 10) + 1; // cycles 1..10
        const imgSrc = `/dashboard/bg/image-${imgIndex}.png`;
        const updated = form.updatedAt ? new Date(form.updatedAt).toLocaleDateString() : "-";
        const visibilityLabel = String(form.visibility).toLowerCase();
        const visibilityClass =
          visibilityLabel === "public"
            ? "bg-green-700 text-white"
            : visibilityLabel === "unlisted"
              ? "bg-yellow-300 text-black"
              : "bg-gray-400 text-black";

        return (
          <div
            key={form.formId}
            className="px-6 py-4 grid grid-cols-24 gap-4 items-center border-b border-[#626262] hover:bg-[#0b0d0e] min-h-20"
          >
            {/* FORM */}
            <div className="col-span-12 flex items-center gap-4">
              <div className="w-20 h-14 bg-cover bg-center rounded-lg overflow-hidden shrink-0">
                <Image src={imgSrc} alt={form.formTitle} width={160} height={96} />
              </div>
              <div>
                <div className="text-[14px] font-black tracking-[0.06em] uppercase">
                  {form.formTitle}
                </div>
                <div className="text-[12px] text-muted-foreground mt-1">{form.formDescription}</div>
              </div>
            </div>

            {/* RESPONSES */}
            <div className="m-auto col-span-3 text-center font-black text-[16px] flex items-center justify-center gap-2">
              {form.responseCount}
            </div>

            {/* VISIBILITY */}
            <div className="col-span-3 m-auto">
              <span
                className={`px-3 py-1 rounded-full text-[11px] font-black tracking-[0.08em] uppercase ${visibilityClass}`}
              >
                {visibilityLabel}
              </span>
            </div>

            {/* UPDATED */}
            <div className="m-auto col-span-3 text-[12px] text-[#bdbdbd]">{updated}</div>

            {/* ACTIONS */}
            <div className="col-span-3 text-right m-auto">
              <button onClick={() => handleEdit(form.formId)} className="h-10 px-4 rounded-lg border border-[#626262] bg-[#0b0d0e] text-[13px] font-black tracking-[0.08em] uppercase">
                Edit
              </button>
            </div>
          </div>
        );
      })}
    </>
  );
};

export default FormList;
