"use client";

import { useState, type FormEvent } from "react";
import { useParams, useSearchParams } from "next/navigation";

import { Calendar } from "~/components/ui/calendar";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "~/components/ui/popover";
import { useGetPublicFormById } from "~/hooks/api/form";

type PublicFormField = {
  id?: string;
  label?: string;
  type?: string;
  isRequired?: boolean;
  description?: string;
};

export default function PublicFormPage() {
  const params = useParams<{ id: string; slug: string }>();
  const searchParams = useSearchParams();
  const formId = params?.id;
  const slug = params?.slug;
  const [accessKeyInput, setAccessKeyInput] = useState(searchParams.get("accessKey") ?? "");
  const [submittedAccessKey, setSubmittedAccessKey] = useState(searchParams.get("accessKey") ?? "");
  const [selectedDates, setSelectedDates] = useState<Record<string, Date | undefined>>({});

  const { publicFormById, isLoading, error } = useGetPublicFormById({
    formId,
    slug,
    accessKey: submittedAccessKey || undefined,
  });

  const handleAccessKeySubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmittedAccessKey(accessKeyInput.trim());
  };

  const isAccessKeyError = Boolean(error && !publicFormById);

  const formatSelectedDate = (date?: Date) =>
    date
      ? date.toLocaleDateString(undefined, {
          month: "short",
          day: "numeric",
          year: "numeric",
        })
      : "Pick a date";

  return (
    <main className="min-h-screen bg-[#0b0c0d] px-4 py-8 text-foreground md:px-6 lg:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-5xl flex-col gap-6 rounded-[28px] border border-[#222428] bg-[#111214] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.35)] md:p-8">
        <div className="flex flex-col gap-3 border-b border-[#24262a] pb-6 md:flex-row md:items-end md:justify-between">
          <div className="space-y-2">
            <p className="text-[11px] font-black uppercase tracking-[0.18em] text-[#8f8f8f]">
              Public Form
            </p>
            <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
              {publicFormById?.title ?? "Loading form..."}
            </h1>
            <p className="max-w-2xl text-sm text-muted-foreground">
              {publicFormById?.description ?? "This form is accessible through the published redirect URL."}
            </p>
          </div>

          {publicFormById ? (
            <div className="rounded-full border border-[#2a2d31] bg-[#0e0f11] px-4 py-2 text-[11px] font-black uppercase tracking-[0.14em] text-[#bdbdbd]">
              {publicFormById.visibility}
            </div>
          ) : null}
        </div>

        {isAccessKeyError ? (
          <form
            className="flex w-full max-w-xl flex-col gap-3 rounded-2xl border border-[#2a2d31] bg-[#0d0e10] p-5"
            onSubmit={handleAccessKeySubmit}
          >
            <div className="space-y-1">
              <h2 className="text-lg font-semibold">Access key required</h2>
              <p className="text-sm text-muted-foreground">
                This form is unlisted. Enter the access key to continue.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Input
                value={accessKeyInput}
                onChange={(event) => setAccessKeyInput(event.target.value)}
                placeholder="Enter access key"
                className="h-11 border-[#2f3238] bg-[#111214] text-foreground placeholder:text-muted-foreground"
              />
              <Button type="submit" className="h-11 bg-[#14b84d] text-white hover:bg-[#14b84d]/90">
                Unlock
              </Button>
            </div>
            {error ? <p className="text-xs text-[#f2c94c]">{error.message}</p> : null}
          </form>
        ) : null}

        {isLoading ? (
          <div className="rounded-2xl border border-dashed border-[#2a2d31] bg-[#0d0e10] p-6 text-sm text-muted-foreground">
            Loading form...
          </div>
        ) : null}

        {publicFormById ? (
          <section className="grid gap-4">
            <div className="grid gap-3 md:grid-cols-2">
              <div className="rounded-2xl border border-[#2a2d31] bg-[#0d0e10] p-5">
                <div className="text-[11px] font-black uppercase tracking-[0.16em] text-[#7d7d7d]">
                  Redirect URL
                </div>
                <div className="mt-2 break-all text-sm text-muted-foreground">
                  {publicFormById.redirectUrl}
                </div>
              </div>
              <div className="rounded-2xl border border-[#2a2d31] bg-[#0d0e10] p-5">
                <div className="text-[11px] font-black uppercase tracking-[0.16em] text-[#7d7d7d]">
                  Access
                </div>
                <div className="mt-2 text-sm text-muted-foreground">
                  {publicFormById.requiresAccessKey ? "Access key required" : "Open access"}
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-[#2a2d31] bg-[#0d0e10] p-5">
              <div className="mb-4 text-[11px] font-black uppercase tracking-[0.16em] text-[#7d7d7d]">
                Fields
              </div>
              <div className="grid gap-3">
                {publicFormById.fields.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-[#2a2d31] px-4 py-6 text-sm text-muted-foreground">
                    No fields have been added yet.
                  </div>
                ) : (
                  publicFormById.fields.map((field: PublicFormField, index: number) => (
                    <div
                      key={`${field.id ?? field.label ?? index}`}
                      className="rounded-xl border border-[#23262b] bg-[#111214] p-4"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <div className="text-sm font-semibold uppercase tracking-[0.08em]">
                            {field.label ?? "Untitled field"}
                          </div>
                          <div className="mt-1 text-xs uppercase tracking-[0.12em] text-[#8f8f8f]">
                            {field.type}
                          </div>
                        </div>
                        <div className="rounded-full border border-[#2a2d31] px-3 py-1 text-[11px] font-black uppercase tracking-[0.12em] text-[#bdbdbd]">
                          {field.isRequired ? "Required" : "Optional"}
                        </div>
                      </div>
                      {field.description ? (
                        <p className="mt-3 text-sm text-muted-foreground">{field.description}</p>
                      ) : null}

                      {field.type === "date" ? (
                        <div className="mt-4">
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                type="button"
                                variant="outline"
                                className="h-11 w-full justify-between border-[#2f3238] bg-[#0b0c0d] px-4 text-left text-sm text-white hover:bg-[#14161a]"
                              >
                                <span>{formatSelectedDate(selectedDates[field.id ?? index])}</span>
                                <span className="text-[11px] font-black uppercase tracking-[0.12em] text-[#8f8f8f]">
                                  Choose date
                                </span>
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent
                              align="start"
                              className="w-auto border-[#2a2d31] bg-[#0f1113] p-3 shadow-[0_24px_80px_rgba(0,0,0,0.45)]"
                            >
                              <Calendar
                                mode="single"
                                selected={selectedDates[field.id ?? index]}
                                onSelect={(date) =>
                                  setSelectedDates((current) => ({
                                    ...current,
                                    [field.id ?? index]: date,
                                  }))
                                }
                                className="rounded-xl border border-[#2a2d31] bg-[#111214] p-2"
                                buttonVariant="ghost"
                              />
                            </PopoverContent>
                          </Popover>
                        </div>
                      ) : null}
                    </div>
                  ))
                )}
              </div>
            </div>
          </section>
        ) : null}
      </div>
    </main>
  );
}
