"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { toast } from "sonner";

import { Button } from "~/components/ui/button";
import { Calendar } from "~/components/ui/calendar";
import { Checkbox } from "~/components/ui/checkbox";
import { Input } from "~/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "~/components/ui/popover";
import { Textarea } from "~/components/ui/textarea";
import { cn } from "~/lib/utils";
import { useGetFormResponses, useGetPublicFormById, useSubmitFormResponse } from "~/hooks/api/form";

type PublicFormField = {
  id?: string;
  label?: string;
  type?: string;
  isRequired?: boolean;
  description?: string;
  placeholder?: string;
  options?: string[];
  ratingScale?: number;
};

type FormValues = Record<string, unknown>;

const monoStyle = { fontFamily: "var(--font-geist-mono)" };

const getFieldId = (field: PublicFormField, index: number) => field.id ?? String(index);

const buildDefaultValues = (fields: PublicFormField[]) => {
  const nextValues: FormValues = {};

  fields.forEach((field, index) => {
    const fieldId = getFieldId(field, index);

    if (field.type === "multi_select") {
      nextValues[fieldId] = [];
      return;
    }

    if (field.type === "rating") {
      nextValues[fieldId] = 0;
      return;
    }

    if (field.type === "date") {
      nextValues[fieldId] = "";
      return;
    }

    nextValues[fieldId] = "";
  });

  return nextValues;
};

const cleanSubmittedAnswers = (fields: PublicFormField[], values: FormValues) => {
  return fields.reduce<Record<string, unknown>>((answers, field, index) => {
    const fieldId = getFieldId(field, index);
    const value = values[fieldId];

    if (value === undefined || value === null) return answers;
    if (typeof value === "string" && value.trim() === "") return answers;
    if (Array.isArray(value) && value.length === 0) return answers;
    if (typeof value === "number" && Number.isNaN(value)) return answers;
    if (field.type === "rating" && Number(value) <= 0) return answers;

    answers[fieldId] = value;
    return answers;
  }, {});
};

const formatDateLabel = (value?: string) => {
  if (!value) return "Pick a date";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Pick a date";

  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

export default function PublicFormPage() {
  const params = useParams<{ id: string; slug: string }>();
  const searchParams = useSearchParams();
  const formId = params?.id;
  const slug = params?.slug;
  const [accessKeyInput, setAccessKeyInput] = useState(searchParams.get("accessKey") ?? "");
  const [submittedAccessKey, setSubmittedAccessKey] = useState(searchParams.get("accessKey") ?? "");
  const [gateMessage, setGateMessage] = useState("Enter the access key to continue.");

  const { publicFormById, isLoading, error } = useGetPublicFormById({
    formId,
    slug,
    accessKey: submittedAccessKey || undefined,
  });
  const { submitFormResponseAsync, isSuccess } = useSubmitFormResponse();
  const { refetch: refetchResponses, formResponsesById } = useGetFormResponses({ formId });
  const fields = (publicFormById?.fields ?? []) as PublicFormField[];
  const isAccessKeyError = Boolean(error && !publicFormById);
  const isUnlistedForm = publicFormById?.visibility === "unlisted" || Boolean(isAccessKeyError);
  const [isUnlistedFormAuthorized, setIsUnlistedFormAuthorized] = useState(false);
  useEffect(() => {
    if (isSuccess) {
      refetchResponses();
    }
  }, [isSuccess, refetchResponses]);

  const pageStyle = useMemo(
    () => ({
      backgroundImage: "url('/dashboard/bg-edit-form.png')",
    }),
    [],
  );

  const {
    control,
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
    reset,
    watch,
  } = useForm<FormValues>({ defaultValues: buildDefaultValues(fields) });

  useEffect(() => {
    if (!publicFormById) return;
    reset(buildDefaultValues(fields));
  }, [fields, publicFormById, reset]);

  useEffect(() => {
    if (!error) {
      setGateMessage("Enter the access key to continue.");
      return;
    }

    if (!publicFormById) {
      setGateMessage(error.message || "Access key required.");
    }
  }, [error, publicFormById]);

  const handleAccessKeySubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsUnlistedFormAuthorized(true);

    setSubmittedAccessKey(accessKeyInput.trim());
  };

  const onSubmit = handleSubmit(async (values) => {
    if (!publicFormById || !formId || !slug) return;

    const answers = cleanSubmittedAnswers(fields, values);

    if (Object.keys(answers).length === 0) {
      toast.error("Please answer at least one field before submitting.");
      return;
    }

    try {
      await submitFormResponseAsync({
        formId,
        slug,
        accessKey: submittedAccessKey || undefined,
        answers,
      });

      toast.success("Response saved.");
      reset(buildDefaultValues(fields));
    } catch (submitError) {
      toast.error(submitError instanceof Error ? submitError.message : "Unable to save response.");
    }
  });

  const responseSubmitted = isSuccess;

  return (
    <main
      className="relative min-h-screen overflow-hidden bg-[#050607] px-4 py-6 text-white sm:px-6 lg:px-8"
      style={pageStyle}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(24,74,35,0.26),transparent_42%),linear-gradient(180deg,rgba(3,4,5,0.45),rgba(3,4,5,0.86))]" />
      <div className="absolute inset-0 backdrop-blur-[2px]" />

      <div className="relative mx-auto flex min-h-[calc(100vh-3rem)] w-full max-w-5xl flex-col gap-5">
        <header className="flex items-start justify-between gap-4 rounded-[28px] border border-[#1f2327] bg-[rgba(8,10,11,0.72)] px-5 py-4 shadow-[0_24px_80px_rgba(0,0,0,0.45)] backdrop-blur-xl sm:px-6">
          <div className="space-y-2">
            <div className="text-[11px] font-black uppercase tracking-[0.26em] text-[#93a08f]">
              Public Form
            </div>
            <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-[2.6rem]">
              {publicFormById?.title ?? "Loading form..."}
            </h1>
            <p className="max-w-2xl text-sm text-[#b7beb2] sm:text-[15px]">
              {publicFormById?.description ??
                "Fill out the form below and submit your response directly from the public link."}
            </p>
          </div>

          {publicFormById ? (
            <div
              className={cn(
                "rounded-full border px-4 py-2 text-[11px] font-black uppercase tracking-[0.14em]",
                publicFormById.visibility === "public"
                  ? "border-[#1f4f2b] bg-[#0f2216] text-[#64d682]"
                  : "border-[#3b3422] bg-[#1f1a10] text-[#e8c66a]",
              )}
            >
              {publicFormById.visibility}
            </div>
          ) : null}
        </header>

        {isUnlistedForm && !isUnlistedFormAuthorized && isAccessKeyError ? (
          <form
            className="w-full max-w-xl rounded-[24px] border border-[#23272b] bg-[rgba(8,10,11,0.76)] p-5 shadow-[0_24px_80px_rgba(0,0,0,0.4)] backdrop-blur-xl"
            onSubmit={handleAccessKeySubmit}
          >
            <div className="space-y-1.5">
              <h2 className="text-lg font-semibold text-white">Access key required</h2>
              <p className="text-sm text-[#aeb5ad]">{gateMessage}</p>
            </div>
            <div className="mt-4 flex flex-col gap-3 sm:flex-row">
              <Input
                value={accessKeyInput}
                onChange={(event) => setAccessKeyInput(event.target.value)}
                placeholder="Enter access key"
                className="h-11 border-[#2f3439] bg-[#111417] text-white placeholder:text-[#79807a]"
              />
              <Button
                type="submit"
                className="h-11 bg-[#14b84d] px-5 text-white hover:bg-[#16c353]"
              >
                Submit
              </Button>
            </div>
            {error ? <p className="mt-3 text-xs text-[#f2c94c]">{error.message}</p> : null}
          </form>
        ) : null}

        {isLoading ? (
          <div className="rounded-[24px] border border-dashed border-[#2a2e33] bg-[rgba(8,10,11,0.7)] p-6 text-sm text-[#b7beb2] backdrop-blur-xl">
            Loading form...
          </div>
        ) : null}

        {publicFormById ? (
          <section
            style={monoStyle}
            className="rounded-[28px] border border-[#1f2327] bg-[rgba(8,10,11,0.78)] p-4 shadow-[0_24px_80px_rgba(0,0,0,0.45)] backdrop-blur-xl sm:p-6"
          >
            <div className="mb-4 flex flex-col gap-2 border-b border-[#24282d] pb-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-[11px] font-black uppercase tracking-[0.22em] text-[#6c756d]">
                  {fields.length} Fields
                </p>
                <h2 className="text-xl font-semibold text-white">Complete the form</h2>
              </div>
              <div className="text-xs text-[#8f968f]">
                Responses are stored securely after submission.
              </div>
            </div>

            {responseSubmitted ? (
              <div className="mb-4 rounded-2xl border border-[#1f4f2b] bg-[#0f2216] px-4 py-3 text-sm text-[#9ce3aa]">
                Response submitted successfully.
              </div>
            ) : null}

            <form className="space-y-4" onSubmit={onSubmit}>
              {fields.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-[#2a2e33] px-4 py-8 text-center text-sm text-[#aeb5ad]">
                  No fields have been added yet.
                </div>
              ) : (
                fields.map((field, index) => {
                  const fieldId = getFieldId(field, index);
                  const fieldType = field.type ?? "short_text";

                  return (
                    <div
                      key={fieldId}
                      className="rounded-[22px] border border-[#23282c] bg-[#0d1013] p-4 shadow-[0_18px_50px_rgba(0,0,0,0.2)]"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="inline-flex h-7 min-w-7 items-center justify-center rounded-md border border-[#1f4f2b] bg-[#102116] px-2 text-xs font-black text-[#59cf77]">
                              {index + 1}
                            </span>
                            <h3 className="text-lg font-semibold text-white">
                              {field.label?.trim() ? field.label : "Untitled field"}
                            </h3>
                          </div>
                          <p className="mt-1 text-xs uppercase tracking-[0.14em] text-[#8b938c]">
                            {fieldType.replaceAll("_", " ")}
                          </p>
                        </div>

                        {field.isRequired ? (
                          <div className="rounded-full border border-[#3b3422] bg-[#1f1a10] px-3 py-1 text-[11px] font-black uppercase tracking-[0.14em] text-[#e8c66a]">
                            Required
                          </div>
                        ) : (
                          <div className="rounded-full border border-[#24282d] bg-[#111417] px-3 py-1 text-[11px] font-black uppercase tracking-[0.14em] text-[#8f968f]">
                            Optional
                          </div>
                        )}
                      </div>

                      {field.description ? (
                        <p className="mt-3 text-sm text-[#b0b7af]">{field.description}</p>
                      ) : null}

                      <div className="mt-4">
                        {fieldType === "short_text" ||
                        fieldType === "email" ||
                        fieldType === "number" ? (
                          <Input
                            type={
                              fieldType === "number"
                                ? "number"
                                : fieldType === "email"
                                  ? "email"
                                  : "text"
                            }
                            placeholder={field.placeholder ?? "Enter your answer"}
                            className="h-11 border-[#2f3439] bg-[#111417] text-white placeholder:text-[#79807a]"
                            {...register(fieldId, {
                              required: field.isRequired ? "This field is required" : false,
                              valueAsNumber: fieldType === "number",
                            })}
                          />
                        ) : null}

                        {fieldType === "long_text" ? (
                          <Textarea
                            placeholder={field.placeholder ?? "Write your answer..."}
                            className="min-h-28 border-[#2f3439] bg-[#111417] text-white placeholder:text-[#79807a]"
                            {...register(fieldId, {
                              required: field.isRequired ? "This field is required" : false,
                            })}
                          />
                        ) : null}

                        {fieldType === "select" ? (
                          <select
                            className="h-11 w-full rounded-md border border-[#2f3439] bg-[#111417] px-3 text-white"
                            {...register(fieldId, {
                              required: field.isRequired ? "This field is required" : false,
                            })}
                          >
                            <option value="">Select an option</option>
                            {(field.options ?? []).map((option) => (
                              <option key={option} value={option}>
                                {option}
                              </option>
                            ))}
                          </select>
                        ) : null}

                        {fieldType === "multi_select" ? (
                          <Controller
                            control={control}
                            name={fieldId}
                            rules={{
                              validate: (currentValue) => {
                                if (!field.isRequired) return true;
                                return Array.isArray(currentValue) && currentValue.length > 0
                                  ? true
                                  : "Select at least one option";
                              },
                            }}
                            render={({ field: controllerField }) => {
                              const selectedValues = Array.isArray(controllerField.value)
                                ? (controllerField.value as string[])
                                : [];

                              return (
                                <div className="grid gap-2 sm:grid-cols-2">
                                  {(field.options ?? []).map((option) => {
                                    const isChecked = selectedValues.includes(option);

                                    return (
                                      <label
                                        key={option}
                                        className={cn(
                                          "flex cursor-pointer items-center gap-3 rounded-xl border px-3 py-2 transition-colors",
                                          isChecked
                                            ? "border-[#1f4f2b] bg-[#102116] text-white"
                                            : "border-[#2b2f34] bg-[#111417] text-[#d7dbd5]",
                                        )}
                                      >
                                        <Checkbox
                                          checked={isChecked}
                                          onCheckedChange={(checked) => {
                                            const nextValue = checked
                                              ? [...selectedValues, option]
                                              : selectedValues.filter((item) => item !== option);
                                            controllerField.onChange(nextValue);
                                          }}
                                          className="size-5 border-[#3a4147] bg-[#0d1013] data-[state=checked]:border-[#14b84d] data-[state=checked]:bg-[#14b84d]"
                                        />
                                        <span className="text-sm">{option}</span>
                                      </label>
                                    );
                                  })}
                                </div>
                              );
                            }}
                          />
                        ) : null}

                        {fieldType === "rating" ? (
                          <Controller
                            control={control}
                            name={fieldId}
                            rules={{
                              validate: (currentValue) => {
                                if (!field.isRequired) return true;
                                return Number(currentValue) > 0 ? true : "Select a rating";
                              },
                            }}
                            render={({ field: controllerField }) => {
                              const ratingScale = field.ratingScale ?? 5;
                              const currentRating = Number(controllerField.value) || 0;

                              return (
                                <div className="flex flex-wrap gap-2">
                                  {Array.from({ length: ratingScale }).map((_, ratingIndex) => {
                                    const ratingValue = ratingIndex + 1;
                                    const isActive = ratingValue <= currentRating;

                                    return (
                                      <Button
                                        key={ratingValue}
                                        type="button"
                                        variant="outline"
                                        onClick={() => controllerField.onChange(ratingValue)}
                                        className={cn(
                                          "h-11 min-w-11 border-[#2f3439] px-4 text-lg transition-colors",
                                          isActive
                                            ? "border-[#1f4f2b] bg-[#102116] text-[#f6c655] hover:bg-[#102116]"
                                            : "bg-[#111417] text-[#6f766f] hover:bg-[#14181b]",
                                        )}
                                      >
                                        ★
                                      </Button>
                                    );
                                  })}
                                </div>
                              );
                            }}
                          />
                        ) : null}

                        {fieldType === "date" ? (
                          <Controller
                            control={control}
                            name={fieldId}
                            rules={{
                              required: field.isRequired ? "This field is required" : false,
                            }}
                            render={({ field: controllerField }) => {
                              const currentValue =
                                typeof controllerField.value === "string"
                                  ? controllerField.value
                                  : "";
                              const selectedDate = currentValue
                                ? new Date(currentValue)
                                : undefined;

                              const [open, setOpen] = useState(false);

                              return (
                                <Popover open={open} onOpenChange={setOpen}>
                                  <PopoverTrigger asChild>
                                    <Button
                                      type="button"
                                      variant="outline"
                                      className="h-11 w-full justify-between border-[#2f3439] bg-[#111417] px-4 text-left text-sm text-white hover:bg-white"
                                    >
                                      <span>{formatDateLabel(currentValue)}</span>
                                      <span className="text-[11px] font-black uppercase tracking-[0.12em] text-[#8f968f]">
                                        Calendar
                                      </span>
                                    </Button>
                                  </PopoverTrigger>
                                  <PopoverContent
                                    align="start"
                                    className="w-auto border-[#2a2e33] bg-[#0f1113] p-3 shadow-[0_24px_80px_rgba(0,0,0,0.45)]"
                                  >
                                    <Calendar
                                      mode="single"
                                      selected={selectedDate || undefined}
                                      onSelect={(date) => {
                                        controllerField.onChange(date ? date.toISOString() : "");
                                        setOpen(false); // ✅ closes popover after selection
                                      }}
                                      captionLayout="dropdown"
                                      className="rounded-xl border border-gray-300 bg-[#111417] p-2 text-white"
                                    />
                                  </PopoverContent>
                                </Popover>
                              );
                            }}
                          />
                        ) : null}

                        {errors[fieldId] ? (
                          <p className="mt-2 text-xs text-[#f2c94c]">
                            {String(errors[fieldId]?.message ?? "This field is required")}
                          </p>
                        ) : null}
                      </div>
                    </div>
                  );
                })
              )}

              <div className="flex flex-col gap-3 border-t border-[#24282d] pt-2 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-xs text-[#8f968f]">
                  Fields marked required must be completed before submission.
                </p>
                <Button
                  type="submit"
                  className="h-11 bg-[#14b84d] px-6 text-sm font-semibold text-white hover:bg-[#18c953]"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Submitting..." : "Submit Response"}
                </Button>
              </div>
            </form>
          </section>
        ) : null}
      </div>
    </main>
  );
}
