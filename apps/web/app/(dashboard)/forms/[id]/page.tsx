"use client";

import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { Button } from "~/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "~/components/ui/accordion";
import { Checkbox } from "~/components/ui/checkbox";
import { Input } from "~/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { Badge } from "~/components/ui/badge";
import { Textarea } from "~/components/ui/textarea";
import { cn } from "~/lib/utils";
import {
  useCreateFormFields,
  useGetFormById,
  useGetFormResponses,
  usePublishForm,
  useUpdateFormFields,
  useUpdateFormMetadata,
  useUpdateFormSettings,
} from "~/hooks/api/form";

type FieldType =
  | "short_text"
  | "long_text"
  | "email"
  | "number"
  | "select"
  | "multi_select"
  | "rating"
  | "date";

type Field = {
  id: string;
  type: FieldType;
  label: string;
  placeholder?: string;
  description?: string;
  isRequired: boolean;
  options?: string[];
  ratingScale?: number;
  ratingIcon?: "star" | "heart" | "like";
};

type BackendLogicRule = {
  uiId?: string;
  fieldId: string;
  dependsOnFieldId: string;
  operator: "equals" | "not_equals" | "contains" | "greater_than" | "less_than";
  value: unknown;
  action: "show" | "hide";
};

type LogicOperator = BackendLogicRule["operator"];
type LogicAction = BackendLogicRule["action"];
type FormVisibility = "public" | "unlisted" | "draft";

type SettingsState = {
  title: string;
  description: string;
  visibility: FormVisibility;
  accessKey: string;
  responseCount: string;
  expiresAt: string;
};

export default function Page() {
  const params = useParams<{ id: string }>();
  const formId = params?.id;
  const [tab, setTab] = useState<"builder" | "settings" | "responses" | "share">("builder");
  const [logic, setLogic] = useState<BackendLogicRule[]>([]);
  const [selectedFieldId, setSelectedFieldId] = useState<string | null>(null);
  const [formTitle, setFormTitle] = useState("Untitled Form");
  const [formDescription, setFormDescription] = useState("");
  const [publishedRedirectUrl, setPublishedRedirectUrl] = useState("");
  const [isLinkCopied, setIsLinkCopied] = useState(false);
  const [fieldActionError, setFieldActionError] = useState("");
  const [fieldAddCooldownUntil, setFieldAddCooldownUntil] = useState(0);
  const [formVisibility, setFormVisibility] = useState<FormVisibility>("draft");
  const [accessKeyForSettings, setAccessKeyForSettings] = useState("");
  const [settingsResponseCount, setSettingsResponseCount] = useState("");
  const [settingsExpiresAt, setSettingsExpiresAt] = useState("");
  const fieldAddCooldownTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { createFormFieldsAsync } = useCreateFormFields();
  const { updateFormFieldsAsync } = useUpdateFormFields();
  const { updateFormMetadataAsync } = useUpdateFormMetadata();
  const { updateFormSettingsAsync } = useUpdateFormSettings();
  const { publishFormAsync } = usePublishForm();
  const { formById } = useGetFormById({ formId });
  const { formResponsesById, isLoading: isResponsesLoading } = useGetFormResponses(
  { formId },
  { refetchInterval: 5000 } // refetch every 5s
);


  const [fields, setFields] = useState<Field[]>([]);

  const monoStyle = { fontFamily: "var(--font-geist-mono)" };
  const tabs: Array<"builder" | "settings" | "responses" | "share"> = [
    "builder",
    "settings",
    "responses",
    "share",
  ];
  const selectedField = fields.find((field) => field.id === selectedFieldId) ?? null;
  const darkControlClass = "border-[#343434] bg-[#111111] text-white placeholder:text-gray-500";
  const darkMenuControlClass =
    "border-[#343434] bg-[#111111] text-white placeholder:text-gray-500 hover:bg-white";
  const isFieldAddCoolingDown = Date.now() < fieldAddCooldownUntil;

  const generateAccessKey = () => String(Math.floor(100000 + Math.random() * 900000));

  const permanentShareUrl = formById && formVisibility !== "draft" ? formById.redirectUrl : "";

  const responseFields = (formResponsesById?.fields ?? formById?.fields ?? []) as Field[];
  const responseRows = formResponsesById?.responses ?? [];

  const formatResponseValue = (value: unknown, fieldType?: string) => {
    if (value === null || value === undefined || value === "") return "—";

    if (Array.isArray(value)) {
      return value.length > 0 ? value.map((entry) => String(entry)).join(", ") : "—";
    }

    if (fieldType === "date" && typeof value === "string") {
      const date = new Date(value);
      if (!Number.isNaN(date.getTime())) {
        return date.toLocaleDateString(undefined, {
          month: "short",
          day: "numeric",
          year: "numeric",
        });
      }
    }

    return String(value);
  };

  const formatSubmittedAt = (value: string | Date) => {
    const date = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(date.getTime())) return "—";

    return date.toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const toDatetimeLocalValue = (value?: Date | string | null) => {
    if (!value) return "";

    const date = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(date.getTime())) return "";

    const pad = (input: number) => String(input).padStart(2, "0");
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
  };

  const saveSettings = async (overrides: Partial<SettingsState> = {}) => {
    if (!formId) return;

    const nextVisibility = overrides.visibility ?? formVisibility;
    const nextAccessKey =
      nextVisibility === "unlisted" ? (overrides.accessKey ?? accessKeyForSettings).trim() : "";

    await updateFormSettingsAsync({
      formId,
      title: (overrides.title ?? formTitle).trim() || "Untitled Form",
      description: (overrides.description ?? formDescription).trim(),
      visibility: nextVisibility,
      accessKey: nextVisibility === "unlisted" ? nextAccessKey || generateAccessKey() : undefined,
      responseCount: (() => {
        const nextResponseCount = overrides.responseCount ?? settingsResponseCount;
        if (nextResponseCount === "") return undefined;
        const parsed = Number(nextResponseCount);
        return Number.isInteger(parsed) && parsed >= 0 ? parsed : undefined;
      })(),
      expiresAt: (() => {
        const nextExpiresAt = overrides.expiresAt ?? settingsExpiresAt;
        return nextExpiresAt ? new Date(nextExpiresAt) : null;
      })(),
    });
  };

  useEffect(() => {
    return () => {
      if (fieldAddCooldownTimerRef.current) {
        clearTimeout(fieldAddCooldownTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!formById) return;

    setFormTitle(formById.title ?? "Untitled Form");
    setFormDescription(formById.description ?? "");
    setFormVisibility(
      formById.visibility === "public" ||
        formById.visibility === "unlisted" ||
        formById.visibility === "draft"
        ? formById.visibility
        : "draft",
    );
    setAccessKeyForSettings(typeof formById.accessKey === "string" ? formById.accessKey : "");
    setSettingsResponseCount(
      typeof formById.responseCount === "number" ? String(formById.responseCount) : "",
    );
    setSettingsExpiresAt(toDatetimeLocalValue(formById.expiresAt));
    setLogic(
      Array.isArray(formById.logic)
        ? (formById.logic as BackendLogicRule[]).map((rule) => ({
            ...rule,
            uiId: rule.uiId ?? crypto.randomUUID(),
          }))
        : [],
    );

    const nextFields = Array.isArray(formById.fields)
      ? formById.fields.map((field) => ({
          id: String(field.id ?? crypto.randomUUID()),
          type: field.type,
          label: field.label,
          placeholder: field.placeholder,
          description: field.description,
          isRequired: field.isRequired,
          options: field.options,
          ratingScale: field.validations?.max,
          ratingIcon: "star" as const,
        }))
      : [];

    setFields(nextFields);
    setSelectedFieldId(nextFields[0]?.id ?? null);
  }, [formById]);

  const persistFields = async (nextFields: Field[], nextLogic: BackendLogicRule[] = logic) => {
    if (!formId) return;

    const payloadFields = nextFields.map((field) => ({
      type: field.type,
      label: field.label,
      placeholder: field.placeholder,
      description: field.description,
      isRequired: field.isRequired,
      options: field.options,
      validations: field.ratingScale ? { min: 1, max: field.ratingScale } : undefined,
    }));

    await updateFormFieldsAsync({
      formId,
      fields: payloadFields,
      logic: nextLogic,
    });
  };

  const addField = async (type: FieldType) => {
    if (!formId) return;

    if (isFieldAddCoolingDown) {
      toast.error("Please wait 5 seconds before adding another field.");
      return;
    }

    setTab("builder");
    setFieldActionError("");

    const defaultOptions = type === "select" || type === "multi_select" ? ["Option 1"] : undefined;

    const nextField: Field = {
      id: crypto.randomUUID(),
      type,
      label: "",
      isRequired: false,
      placeholder: undefined,
      description: undefined,
      options: defaultOptions,
      ratingScale: type === "rating" ? 5 : undefined,
      ratingIcon: type === "rating" ? "star" : undefined,
    };

    try {
      await createFormFieldsAsync({
        id: formId,
        field: {
          type: nextField.type,
          label: nextField.label,
          isRequired: nextField.isRequired,
          placeholder: nextField.placeholder,
          options: nextField.options,
          validations:
            nextField.type === "rating" ? { min: 1, max: nextField.ratingScale } : undefined,
        },
        logic,
      });

      setFields((prev) => [...prev, nextField]);
      setSelectedFieldId(nextField.id);
      setFieldAddCooldownUntil(Date.now() + 5000);
      if (fieldAddCooldownTimerRef.current) {
        clearTimeout(fieldAddCooldownTimerRef.current);
      }
      fieldAddCooldownTimerRef.current = setTimeout(() => {
        setFieldAddCooldownUntil(0);
      }, 5000);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to add field";
      setFieldActionError(message.includes("5 seconds") ? "" : message);
      setFieldAddCooldownUntil(Date.now() + 5000);
      toast.error(
        message.includes("5 seconds")
          ? "Please wait 5 seconds before adding another field."
          : message,
      );
      if (fieldAddCooldownTimerRef.current) {
        clearTimeout(fieldAddCooldownTimerRef.current);
      }
      fieldAddCooldownTimerRef.current = setTimeout(() => {
        setFieldAddCooldownUntil(0);
        setFieldActionError("");
      }, 5000);
    }
  };

  const updateField = (id: string, key: keyof Field, value: unknown) => {
    setFields((prev) => {
      const nextFields = prev.map((f) => (f.id === id ? { ...f, [key]: value } : f));

      void persistFields(nextFields);
      return nextFields;
    });
  };

  const deleteField = (id: string) => {
    setFields((prev) => {
      const nextFields = prev.filter((f) => f.id !== id);
      if (selectedFieldId === id) {
        setSelectedFieldId(nextFields[0]?.id ?? null);
      }
      void persistFields(nextFields);
      return nextFields;
    });
  };

  const updateSelectedField = (key: keyof Field, value: unknown) => {
    if (!selectedField) return;
    void updateField(selectedField.id, key, value);
  };

  const updateFieldOption = (fieldId: string, optionIndex: number, value: string) => {
    const field = fields.find((item) => item.id === fieldId);
    if (!field) return;

    const nextOptions = [...(field.options ?? [])];
    nextOptions[optionIndex] = value;
    void updateField(fieldId, "options", nextOptions);
  };

  const addFieldOption = (fieldId: string) => {
    const field = fields.find((item) => item.id === fieldId);
    if (!field) return;

    void updateField(fieldId, "options", [
      ...(field.options ?? []),
      `Option ${(field.options?.length ?? 0) + 1}`,
    ]);
  };

  const addLogicRule = () => {
    if (!selectedField) return;
    const otherFieldId =
      fields.find((field) => field.id !== selectedField.id)?.id ?? selectedField.id;

    setLogic((currentLogic) => {
      const nextLogic = [
        ...currentLogic,
        {
          uiId: crypto.randomUUID(),
          fieldId: selectedField.id,
          dependsOnFieldId: otherFieldId,
          operator: "equals" as LogicOperator,
          value: "",
          action: "show" as LogicAction,
        },
      ];

      void persistFields(fields, nextLogic);
      return nextLogic;
    });
  };

  const updateLogicRule = (fieldId: string, key: keyof BackendLogicRule, value: unknown) => {
    setLogic((currentLogic) => {
      const nextLogic = currentLogic.map((rule) =>
        rule.uiId === fieldId ? { ...rule, [key]: value } : rule,
      );

      void persistFields(fields, nextLogic);
      return nextLogic;
    });
  };

  const removeLogicRule = (fieldId: string) => {
    setLogic((currentLogic) => {
      const nextLogic = currentLogic.filter((rule) => rule.uiId !== fieldId);

      void persistFields(fields, nextLogic);
      return nextLogic;
    });
  };

  const publishForm = async () => {
    if (!formId) return;

    const payload = {
      formId,
      title: formTitle,
      description: formDescription,
      fields,
      logic,
    };

    try {
      const publishedForm = await publishFormAsync(payload);
      setPublishedRedirectUrl(publishedForm.redirectUrl ?? formById?.redirectUrl ?? "");
      setIsLinkCopied(false);
      setTab("share");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to publish form";

      if (message.includes('No procedure found on path "form.publishForm"')) {
        await updateFormMetadataAsync({
          formId,
          title: formTitle,
          description: formDescription,
        });

        await updateFormFieldsAsync({
          formId,
          fields: fields.map((field) => ({
            type: field.type,
            label: field.label,
            placeholder: field.placeholder,
            description: field.description,
            isRequired: field.isRequired,
            options: field.options,
            validations: field.ratingScale ? { min: 1, max: field.ratingScale } : undefined,
          })),
          logic,
        });

        setPublishedRedirectUrl(formById?.redirectUrl ?? "");
        setTab("share");

        return;
      }

      throw error;
    }
  };

  const copyPublishedLink = async () => {
    if (!publishedRedirectUrl) return;

    await navigator.clipboard.writeText(publishedRedirectUrl);
    setIsLinkCopied(true);
  };

  const ratingIcons: Record<NonNullable<Field["ratingIcon"]>, string> = {
    star: "★",
    heart: "♥",
    like: "👍",
  };

  const formatFieldTypeLabel = (type: FieldType) =>
    type.replaceAll("_", " ").replace(/\b\w/g, (character) => character.toUpperCase());

  return (
    <div className="flex h-full min-h-0 w-full overflow-hidden text-white" style={monoStyle}>
      {/* LEFT TOOLBAR */}
      <div className="sticky top-0 h-full w-64 shrink-0 overflow-hidden border-r border-[#2a2a2a] p-4 space-y-3">
        <p className="text-xs uppercase text-gray-300 tracking-wider" style={monoStyle}>
          Add Fields
        </p>

        {[
          "short_text",
          "long_text",
          "email",
          "number",
          "select",
          "multi_select",
          "rating",
          "date",
        ].map((type) => (
          <Button
            key={type}
            variant="outline"
            className={`w-full justify-start ${darkMenuControlClass}`}
            onClick={() => void addField(type as FieldType)}
          >
            <span className="" style={monoStyle}>
              {type.replace("_", " ")}
            </span>
          </Button>
        ))}

        {fieldActionError ? (
          <div
            className="rounded-md border border-[#2a2a2a] bg-[#0b0b0b] px-3 py-2 text-[11px] uppercase tracking-[0.14em] text-gray-500"
            style={monoStyle}
          >
            {fieldActionError}
          </div>
        ) : null}
      </div>

      {/* MAIN */}
      <div className="flex h-full min-h-0 flex-1 flex-col overflow-hidden">
        {/* TOP BAR */}
        <div className="shrink-0 border-b border-[#2a2a2a] px-4 py-3">
          <div className="flex flex-col gap-3">
            <div className="space-y-1.5">
              <p
                className="text-[10px] uppercase tracking-[0.28em] text-gray-400"
                style={monoStyle}
              >
                Form Name
              </p>
              <h1 className="text-2xl font-semibold text-white sm:text-[2rem]" style={monoStyle}>
                {formTitle}
              </h1>
              <h2 className="max-w-2xl text-xs text-gray-400 sm:text-sm" style={monoStyle}>
                {formDescription ||
                  "Edit the form title, add fields, and configure conditional logic."}
              </h2>
            </div>

            <div className="flex flex-col gap-3 pt-1 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex gap-5">
                {tabs.map((t) => (
                  <button
                    key={t}
                    onClick={() => setTab(t)}
                    className={cn(
                      "uppercase text-xs tracking-wider sm:text-sm",
                      tab === t ? "text-green-400" : "text-gray-400",
                    )}
                    style={monoStyle}
                  >
                    {t}
                  </button>
                ))}
              </div>

              <div className="flex gap-2">
                <Button
                  className="h-9 bg-green-600 px-4 text-sm hover:bg-green-700"
                  onClick={publishForm}
                >
                  Publish
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* CONTENT */}
        <div className="flex min-h-0 flex-1 overflow-hidden">
          {/* BUILDER */}
          {tab === "builder" && (
            <>
              <div className="min-w-0 flex-1 overflow-y-auto p-4 space-y-4 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                <div className="flex items-end justify-between border-b border-[#232323] pb-3">
                  <div>
                    <h2
                      className="mt-1 text-lg font-semibold uppercase tracking-[0.16em] text-green-400"
                      style={monoStyle}
                    >
                      Preview
                    </h2>
                  </div>
                </div>

                {fields.length === 0 ? (
                  <div className="flex min-h-80 items-center justify-center rounded-xl border border-dashed border-[#2a2a2a] bg-[#0e0e0f] p-8 text-center">
                    <div className="space-y-3 max-w-md">
                      <p className="text-lg text-white" style={monoStyle}>
                        Click the fields to add in form
                      </p>
                      <p className="text-sm text-gray-500" style={monoStyle}>
                        Start with a field type from the left panel, then configure options,
                        required state, and ratings.
                      </p>
                    </div>
                  </div>
                ) : null}

                {fields.map((field, index) => (
                  <div
                    key={field.id}
                    className={cn(
                      "border rounded-lg p-4 bg-[#0e0e0f] transition-colors",
                      selectedFieldId === field.id ? "border-green-500/70" : "border-[#2a2a2a]",
                    )}
                    onClick={() => setSelectedFieldId(field.id)}
                  >
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-300" style={monoStyle}>
                          {index + 1}
                        </span>
                        <span
                          className="rounded-full border border-[#7a1f1f] bg-[#2a1010] px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#ff6b6b]"
                          style={monoStyle}
                        >
                          {formatFieldTypeLabel(field.type)}
                        </span>
                      </div>

                      <Button variant="ghost" onClick={() => void deleteField(field.id)}>
                        <span style={monoStyle}>Delete</span>
                      </Button>
                    </div>

                    <div className="space-y-2 mb-3">
                      <p className="text-lg font-medium text-white" style={monoStyle}>
                        {field.label?.trim() ? field.label : "Untitled Question"}
                      </p>
                      {field.description ? (
                        <p className="text-sm text-gray-500" style={monoStyle}>
                          {field.description}
                        </p>
                      ) : null}
                    </div>

                    {field.type === "long_text" ? (
                      <Textarea
                        placeholder="Answer..."
                        readOnly
                        value=""
                        className="pointer-events-none select-none"
                        style={monoStyle}
                      />
                    ) : field.type === "rating" ? (
                      <div className="space-y-3 rounded-md border border-[#2a2a2a] bg-[#0b0b0b] p-3">
                        <div className="flex flex-wrap gap-2">
                          {Array.from({ length: field.ratingScale ?? 5 }).map((_, ratingIndex) => (
                            <span
                              key={ratingIndex}
                              className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-[#2a2a2a] text-lg"
                            >
                              {ratingIcons[field.ratingIcon ?? "star"]}
                            </span>
                          ))}
                        </div>

                        <p className="text-xs text-gray-500" style={monoStyle}>
                          Rating preview
                        </p>
                      </div>
                    ) : (
                      <Input
                        placeholder="Answer..."
                        readOnly
                        value=""
                        className="pointer-events-none select-none"
                        style={monoStyle}
                      />
                    )}

                    {(field.type === "select" || field.type === "multi_select") && (
                      <div className="mt-4 space-y-3 rounded-md border border-[#2a2a2a] bg-[#0b0b0b] p-3">
                        <div className="flex items-center justify-between">
                          <p className="text-sm text-gray-300" style={monoStyle}>
                            Options preview
                          </p>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          {(field.options ?? []).map((option, optionIndex) => (
                            <span
                              key={`${field.id}-${optionIndex}`}
                              className="rounded-md border border-[#2a2a2a] bg-[#111111] px-3 py-2 text-sm text-white"
                              style={monoStyle}
                            >
                              {option}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="flex items-center gap-2 mt-3">
                      <Checkbox
                        checked={field.isRequired}
                        onCheckedChange={(checked) =>
                          void updateField(field.id, "isRequired", checked === true)
                        }
                        className="size-5 border-[#3a3a3a] bg-[#111111] data-[state=checked]:border-[#14b84d] data-[state=checked]:bg-[#14b84d]"
                      />
                      <span className="text-sm font-medium text-gray-200" style={monoStyle}>
                        Required
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* RIGHT SETTINGS PANEL */}
              <div className="sticky top-0 flex h-full w-80 shrink-0 flex-col overflow-hidden border-l border-[#2a2a2a] p-4 space-y-4">
                <p className="text-sm uppercase text-gray-300" style={monoStyle}>
                  Field Settings
                </p>

                <div className="min-h-0 flex-1 space-y-4 overflow-y-auto pr-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                  {selectedField ? (
                    <>
                      <Input
                        placeholder="Label"
                        value={selectedField.label}
                        onChange={(e) => updateSelectedField("label", e.target.value)}
                        className={`${darkControlClass}`}
                        style={monoStyle}
                      />

                      <div className="space-y-2">
                        <p className="text-sm text-gray-300" style={monoStyle}>
                          Field Type
                        </p>
                        <select
                          className="w-full rounded border border-[#343434] bg-[#111111] p-2 text-white"
                          value={selectedField.type}
                          onChange={(e) => updateSelectedField("type", e.target.value as FieldType)}
                          style={monoStyle}
                        >
                          <option value="short_text">Short Text</option>
                          <option value="long_text">Long Text</option>
                          <option value="email">Email</option>
                          <option value="number">Number</option>
                          <option value="select">Select</option>
                          <option value="multi_select">Multiple Choice</option>
                          <option value="rating">Rating</option>
                          <option value="date">Date</option>
                        </select>
                      </div>

                      <Textarea
                        placeholder="Description"
                        value={selectedField.description ?? ""}
                        onChange={(e) => updateSelectedField("description", e.target.value)}
                        className={darkControlClass}
                        style={monoStyle}
                      />

                      <div className="flex items-center justify-between">
                        <span className="text-sm" style={monoStyle}>
                          Required
                        </span>
                        <Checkbox
                          checked={selectedField.isRequired}
                          onCheckedChange={(checked) =>
                            void updateField(selectedField.id, "isRequired", checked === true)
                          }
                          className="size-5 border-[#3a3a3a] bg-[#111111] data-[state=checked]:border-[#14b84d] data-[state=checked]:bg-[#14b84d]"
                        />
                      </div>

                      {(selectedField.type === "select" ||
                        selectedField.type === "multi_select") && (
                        <div className="space-y-3">
                          <p className="text-sm text-gray-300" style={monoStyle}>
                            Edit options
                          </p>
                          {(selectedField.options ?? []).map((option, optionIndex) => (
                            <div
                              key={`${selectedField.id}-settings-${optionIndex}`}
                              className="flex items-center gap-2"
                            >
                              <Input
                                value={option}
                                onChange={(e) =>
                                  updateFieldOption(selectedField.id, optionIndex, e.target.value)
                                }
                                className={darkControlClass}
                                style={monoStyle}
                              />
                            </div>
                          ))}
                          <Button
                            variant="outline"
                            className={darkControlClass}
                            onClick={() => addFieldOption(selectedField.id)}
                          >
                            <span style={monoStyle}>+ Add Option</span>
                          </Button>
                        </div>
                      )}

                      {selectedField.type === "rating" && (
                        <div className="space-y-3">
                          <p className="text-sm text-gray-300" style={monoStyle}>
                            Rating controls
                          </p>
                          <Input
                            type="number"
                            min={1}
                            max={10}
                            value={selectedField.ratingScale ?? 5}
                            onChange={(e) =>
                              updateSelectedField("ratingScale", Number(e.target.value) || 5)
                            }
                            className={darkControlClass}
                            style={monoStyle}
                          />
                          <div className="grid grid-cols-3 gap-2">
                            {(["star", "heart", "like"] as const).map((icon) => (
                              <Button
                                key={icon}
                                variant={selectedField.ratingIcon === icon ? "default" : "outline"}
                                className={
                                  selectedField.ratingIcon === icon ? "" : darkControlClass
                                }
                                onClick={() => updateSelectedField("ratingIcon", icon)}
                              >
                                <span style={monoStyle}>{ratingIcons[icon]}</span>
                              </Button>
                            ))}
                          </div>
                        </div>
                      )}

                      <Accordion type="single" collapsible defaultValue="logic">
                        <AccordionItem
                          value="logic"
                          className="rounded-md border border-[#2a2a2a] bg-[#0b0b0b] px-3"
                        >
                          <AccordionTrigger className="py-3 text-left hover:no-underline">
                            <span className="text-sm text-gray-300" style={monoStyle}>
                              Conditional Logic
                            </span>
                            <Button
                              variant="outline"
                              className={`${darkControlClass} ml-auto mr-3 h-8 px-3`}
                              onClick={(event) => {
                                event.preventDefault();
                                event.stopPropagation();
                                addLogicRule();
                              }}
                            >
                              <span style={monoStyle}>+ Rule</span>
                            </Button>
                          </AccordionTrigger>

                          <AccordionContent className="pt-0">
                            {logic.filter((rule) => rule.fieldId === selectedField.id).length ===
                            0 ? (
                              <p className="pb-3 text-sm text-gray-500" style={monoStyle}>
                                No rules yet. Add one to show or hide this field based on another
                                field.
                              </p>
                            ) : null}

                            <div className="space-y-3 pb-3">
                              {logic
                                .filter((rule) => rule.fieldId === selectedField.id)
                                .map((rule) => (
                                  <div
                                    key={rule.uiId ?? rule.fieldId}
                                    className="space-y-2 rounded border border-[#2a2a2a] p-3"
                                  >
                                    <div className="flex items-center justify-between gap-3">
                                      <span
                                        className="text-xs uppercase text-gray-500"
                                        style={monoStyle}
                                      >
                                        Rule
                                      </span>
                                      <Button
                                        variant="ghost"
                                        className="text-gray-300 hover:bg-[#1a1a1a] hover:text-white"
                                        onClick={() => removeLogicRule(rule.uiId ?? rule.fieldId)}
                                      >
                                        <span style={monoStyle}>Remove</span>
                                      </Button>
                                    </div>

                                    <div className="grid gap-2 sm:grid-cols-2">
                                      <select
                                        className="w-full rounded border border-[#343434] bg-[#111111] p-2 text-white"
                                        value={rule.operator}
                                        onChange={(e) =>
                                          updateLogicRule(
                                            rule.uiId ?? rule.fieldId,
                                            "operator",
                                            e.target.value as LogicOperator,
                                          )
                                        }
                                        style={monoStyle}
                                      >
                                        <option value="equals">equals</option>
                                        <option value="not_equals">not equals</option>
                                        <option value="contains">contains</option>
                                        <option value="greater_than">greater than</option>
                                        <option value="less_than">less than</option>
                                      </select>

                                      <select
                                        className="w-full rounded border border-[#343434] bg-[#111111] p-2 text-white"
                                        value={rule.action}
                                        onChange={(e) =>
                                          updateLogicRule(
                                            rule.uiId ?? rule.fieldId,
                                            "action",
                                            e.target.value as LogicAction,
                                          )
                                        }
                                        style={monoStyle}
                                      >
                                        <option value="show">show</option>
                                        <option value="hide">hide</option>
                                      </select>
                                    </div>

                                    <select
                                      className="w-full rounded border border-[#343434] bg-[#111111] p-2 text-white"
                                      value={rule.dependsOnFieldId}
                                      onChange={(e) =>
                                        updateLogicRule(
                                          rule.uiId ?? rule.fieldId,
                                          "dependsOnFieldId",
                                          e.target.value,
                                        )
                                      }
                                      style={monoStyle}
                                    >
                                      {fields
                                        .filter((field) => field.id !== selectedField.id)
                                        .map((field) => (
                                          <option key={field.id} value={field.id}>
                                            {field.label}
                                          </option>
                                        ))}
                                    </select>

                                    <Input
                                      value={String(rule.value ?? "")}
                                      onChange={(e) =>
                                        updateLogicRule(
                                          rule.uiId ?? rule.fieldId,
                                          "value",
                                          e.target.value,
                                        )
                                      }
                                      className={darkControlClass}
                                      placeholder="Enter comparison value"
                                      style={monoStyle}
                                    />
                                  </div>
                                ))}
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      </Accordion>
                    </>
                  ) : (
                    <div
                      className="rounded-lg border border-dashed border-[#2a2a2a] p-4 text-sm text-gray-500"
                      style={monoStyle}
                    >
                      Select a field to edit its label, options, and rating controls.
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          {/* SETTINGS */}
          {tab === "settings" && (
            <div className="p-6 space-y-4 w-full max-w-xl">
              <Input
                placeholder="Form Title"
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                onBlur={() => void saveSettings({ title: formTitle })}
                className={darkControlClass}
                style={monoStyle}
              />
              <Textarea
                placeholder="Description"
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                onBlur={() => void saveSettings({ description: formDescription })}
                className={darkControlClass}
                style={monoStyle}
              />

              <div className="space-y-3 rounded-lg border border-[#2a2a2a] bg-[#0e0e0f] p-4">
                <div className="space-y-2">
                  <p
                    className="text-sm uppercase tracking-[0.18em] text-gray-400"
                    style={monoStyle}
                  >
                    Visibility
                  </p>
                  <select
                    className="w-full rounded border border-[#343434] bg-[#111111] p-2 text-white"
                    style={monoStyle}
                    value={formVisibility}
                    onChange={(e) => {
                      const nextVisibility = e.target.value as FormVisibility;
                      setFormVisibility(nextVisibility);

                      if (nextVisibility === "unlisted") {
                        const nextKey = accessKeyForSettings.trim() || generateAccessKey();
                        setAccessKeyForSettings(nextKey);
                        void saveSettings({ visibility: nextVisibility, accessKey: nextKey });
                        return;
                      }

                      setAccessKeyForSettings("");
                      void saveSettings({ visibility: nextVisibility, accessKey: "" });
                    }}
                  >
                    <option value="public">public</option>
                    <option value="unlisted">unlisted</option>
                    <option value="draft">draft</option>
                  </select>
                </div>

                {formVisibility === "unlisted" ? (
                  <div className="space-y-2">
                    <p
                      className="text-sm uppercase tracking-[0.18em] text-gray-400"
                      style={monoStyle}
                    >
                      Access Key
                    </p>
                    <Input
                      placeholder="6-digit access key"
                      value={accessKeyForSettings}
                      onChange={(e) => setAccessKeyForSettings(e.target.value)}
                      onBlur={() => void saveSettings({ accessKey: accessKeyForSettings })}
                      className="h-11 border-[#343434] bg-[#111111] text-white placeholder:text-gray-500"
                    />
                    <p className="text-xs text-gray-500" style={monoStyle}>
                      Generated automatically when you switch to unlisted. You can edit it here.
                    </p>
                  </div>
                ) : null}

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-2">
                    <p
                      className="text-sm uppercase tracking-[0.18em] text-gray-400"
                      style={monoStyle}
                    >
                      Response Count
                    </p>
                    <Input
                      type="number"
                      min={0}
                      value={settingsResponseCount}
                      onChange={(e) => setSettingsResponseCount(e.target.value)}
                      onBlur={() => void saveSettings({ responseCount: settingsResponseCount })}
                      className="h-11 border-[#343434] bg-[#111111] text-white placeholder:text-gray-500"
                    />
                  </div>

                  <div className="space-y-2">
                    <p
                      className="text-sm uppercase tracking-[0.18em] text-gray-400"
                      style={monoStyle}
                    >
                      Expires At
                    </p>
                    <Input
                      type="datetime-local"
                      value={settingsExpiresAt}
                      onChange={(e) => setSettingsExpiresAt(e.target.value)}
                      onBlur={() => void saveSettings({ expiresAt: settingsExpiresAt })}
                      className="h-11 border-[#343434] bg-[#111111] text-white placeholder:text-gray-500"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* RESPONSES */}
          {tab === "responses" && (
            <div className="w-full space-y-4 p-6">
              <div className="space-y-2">
                <p
                  className="text-[11px] font-black uppercase tracking-[0.18em] text-gray-500"
                  style={monoStyle}
                >
                  Responses
                </p>
                <div className="flex items-center gap-3">
                  <h2 className="text-2xl font-semibold text-white" style={monoStyle}>
                    User submissions
                  </h2>
                  <Badge variant="outline" className="border-[#1f4f2b] bg-[#102116] text-[#59cf77]">
                    Live
                  </Badge>
                </div>
                <p className="text-sm text-gray-500" style={monoStyle}>
                  Review saved answers from the public form in a structured table.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-lg border border-[#2a2a2a] bg-[#0e0e0f] p-4">
                  <p
                    className="text-[11px] uppercase tracking-[0.18em] text-gray-500"
                    style={monoStyle}
                  >
                    Total Responses
                  </p>
                  <div className="mt-2 text-2xl font-semibold text-white" style={monoStyle}>
                    {(formResponsesById?.responseCount ?? responseRows.length).toLocaleString()}
                  </div>
                </div>

                <div className="rounded-lg border border-[#2a2a2a] bg-[#0e0e0f] p-4">
                  <p
                    className="text-[11px] uppercase tracking-[0.18em] text-gray-500"
                    style={monoStyle}
                  >
                    Fields
                  </p>
                  <div className="mt-2 text-2xl font-semibold text-white" style={monoStyle}>
                    {responseFields.length.toLocaleString()}
                  </div>
                </div>

                <div className="rounded-lg border border-[#2a2a2a] bg-[#0e0e0f] p-4">
                  <p
                    className="text-[11px] uppercase tracking-[0.18em] text-gray-500"
                    style={monoStyle}
                  >
                    Latest Submission
                  </p>
                  <div className="mt-2 text-sm font-medium text-white" style={monoStyle}>
                    {responseRows[0]
                      ? formatSubmittedAt(responseRows[0].submittedAt)
                      : "No responses yet"}
                  </div>
                </div>
              </div>

              <div className="rounded-lg border border-[#2a2a2a] bg-[#0e0e0f] p-4">
                {isResponsesLoading ? (
                  <div className="py-6 text-sm text-gray-500" style={monoStyle}>
                    Loading responses...
                  </div>
                ) : responseRows.length === 0 ? (
                  <div className="py-6 text-sm text-gray-500" style={monoStyle}>
                    No responses have been submitted yet.
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow className="border-[#242424] hover:bg-transparent">
                        <TableHead className="text-gray-400" style={monoStyle}>
                          Submitted At
                        </TableHead>
                        {responseFields.map((field, index) => (
                          <TableHead
                            key={`${field.id ?? index}-header`}
                            className="text-gray-400"
                            style={monoStyle}
                          >
                            {field.label?.trim() ? field.label : `Field ${index + 1}`}
                          </TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {responseRows.map((response) => (
                        <TableRow key={response.id} className="border-[#242424] hover:bg-[#111111]">
                          <TableCell className="whitespace-nowrap text-gray-300" style={monoStyle}>
                            {formatSubmittedAt(response.submittedAt)}
                          </TableCell>
                          {responseFields.map((field, index) => {
                            const fieldId = field.id ?? String(index);
                            const answer = response.answers?.[fieldId];

                            return (
                              <TableCell
                                key={`${response.id}-${fieldId}`}
                                className="max-w-[16rem] whitespace-normal text-gray-200"
                              >
                                {formatResponseValue(answer, field.type)}
                              </TableCell>
                            );
                          })}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </div>
            </div>
          )}

          {/* SHARE */}
          {tab === "share" && (
            <div className="p-6 space-y-4 max-w-2xl">
              <div className="space-y-2">
                <p
                  className="text-[11px] font-black uppercase tracking-[0.18em] text-gray-500"
                  style={monoStyle}
                >
                  Share
                </p>
                <h2 className="text-2xl font-semibold text-white" style={monoStyle}>
                  Share your published form
                </h2>
                <p className="text-sm text-gray-500" style={monoStyle}>
                  Copy the public redirect URL and send it to anyone who should access the form.
                </p>
              </div>

              <div className="flex flex-col gap-3 rounded-2xl border border-[#2a2a2a] bg-[#0e0e0f] p-4 sm:flex-row">
                <Input
                  value={
                    permanentShareUrl ||
                    publishedRedirectUrl ||
                    "Publish the form to generate a redirect URL"
                  }
                  readOnly
                  className="h-11 border-[#343434] bg-[#111111] text-white placeholder:text-gray-500"
                  style={monoStyle}
                />
                <Button
                  type="button"
                  className="h-11 bg-green-600 px-5 text-sm hover:bg-green-700"
                  onClick={() => void copyPublishedLink()}
                  disabled={!(permanentShareUrl || publishedRedirectUrl)}
                >
                  {isLinkCopied ? "Copied" : "Copy Link"}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
