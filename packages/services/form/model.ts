import { z } from "zod";

export const createFormWithTitleAndDescriptionInput = z.object({
  creatorId: z.string().describe("Id of the user"),
  title: z.string().describe("title of the form"),
  description: z.string().describe("description of the form"),
});

export type CreateFormWithTitleAndDescriptionType = z.infer<
  typeof createFormWithTitleAndDescriptionInput
>;

export const getFormsDataByUserIdInput = z.object({
  id: z.string().describe("id of the user"),
  pageSize: z.number().describe("current page size to display forms"),
  page: z.number().describe("current page number of the user"),
});

export type GetFormsDataByUserIdType = z.infer<typeof getFormsDataByUserIdInput>;

export const getFormByIdInput = z.object({
  formId: z.string().describe("Id of the form"),
});

export type GetFormByIdType = z.infer<typeof getFormByIdInput>;

export const getPublicFormByIdInput = z.object({
  formId: z.string().describe("Id of the form"),
  slug: z.string().describe("slug of the form"),
  accessKey: z.string().optional().describe("Access key for unlisted forms"),
});

export type GetPublicFormByIdType = z.infer<typeof getPublicFormByIdInput>;

export const setFormAccessKeyInput = z.object({
  formId: z.string().describe("Id of the form"),
  accessKey: z.string().optional().describe("Access key to store for the form"),
});

export type SetFormAccessKeyType = z.infer<typeof setFormAccessKeyInput>;

export const updateFormMetadataInput = z.object({
  formId: z.string().describe("Id of the form"),
  title: z.string().describe("title of the form"),
  description: z.string().describe("description of the form").optional(),
  visibility: z.enum(["public", "unlisted", "draft"]).optional().describe("visibility of the form"),
});

export type UpdateFormMetadataType = z.infer<typeof updateFormMetadataInput>;

export const updateFormSettingsInput = z.object({
  formId: z.string().describe("Id of the form"),
  title: z.string().describe("title of the form"),
  description: z.string().optional().describe("description of the form"),
  visibility: z.enum(["public", "unlisted", "draft"]).describe("visibility of the form"),
  accessKey: z.string().optional().describe("access key for the form"),
  responseCount: z.number().int().min(0).optional().describe("response count for the form"),
  expiresAt: z.union([z.string(), z.date()]).nullable().optional().describe("expiry timestamp"),
});

export type UpdateFormSettingsType = z.infer<typeof updateFormSettingsInput>;

export const updateFormSettingsOutputModel = z.object({
  id: z.string().describe("Id of the form"),
  title: z.string().describe("title of the form"),
  description: z.string().nullable().describe("description of the form"),
  slug: z.string().describe("slug of the form"),
  visibility: z.enum(["public", "unlisted", "draft"]).describe("visibility of the form"),
  redirectUrl: z.string().nullable().describe("Redirect URL for the form"),
  responseCount: z.number().nullable().optional().describe("response count for the form"),
  expiresAt: z.union([z.string(), z.date()]).nullable().optional().describe("expiry timestamp"),
  updatedAt: z.union([z.string(), z.date()]).describe("Last updated timestamp"),
});

const fieldTypeSchema = z.enum([
  "short_text",
  "long_text",
  "email",
  "number",
  "select",
  "multi_select",
  "rating",
  "date",
]);
export const field = z.object({
  type: fieldTypeSchema.describe("Type of field"),
  label: z.string().describe("label of field"),
  placeholder: z.string().describe("placeholder of field").optional(),
  description: z.string().describe("Description of field").optional(),
  isRequired: z.boolean().default(false).describe("required field or not"),
  options: z.array(z.string()).optional(),
  validations: z
    .object({
      min: z.number().optional(),
      max: z.number().optional(),
      regex: z.string().optional(),
    })
    .optional(),
});

export const conditionalLogicRule = z.object({
  fieldId: z.string().describe("The ID of the field that will change state"),
  dependsOnFieldId: z.string().describe("The ID of the field being watched"),
  operator: z
    .enum(["equals", "not_equals", "contains", "greater_than", "less_than"])
    .describe("Operator to compare with"),
  value: z.any().describe("Value to compare against"),
  action: z.enum(["show", "hide"]).describe("Action to apply when rule matches"),
});

export const createFormFieldsInput = z.object({
  formId: z.string().describe("Form Id of User"),
  field: field.describe("field to add"),
  logic: z
    .array(conditionalLogicRule)
    .optional()
    .describe("optional conditional logic rules to save with the field"),
});

export type CreateFormFieldsType = z.infer<typeof createFormFieldsInput>;

export const updateFormFieldsInput = z.object({
  formId: z.string().describe("Form Id of User"),
  fields: z.array(field).describe("fields to add"),
  logic: z.array(conditionalLogicRule).optional().describe("optional conditional logic rules"),
});

export type UpdateFormFieldsType = z.infer<typeof updateFormFieldsInput>;

export const publishFormInput = z.object({
  formId: z.string().describe("Form Id of User"),
  title: z.string().describe("title of the form"),
  description: z.string().describe("description of the form").optional(),
  fields: z.array(field).describe("fields to save"),
  logic: z.array(conditionalLogicRule).optional().describe("optional conditional logic rules"),
});

export type PublishFormType = z.infer<typeof publishFormInput>;

export const responseData = z.object({
  id: z.string().describe("Id of the response"),
  answers: z.record(z.string(), z.any()).describe("Submitted answers keyed by field id"),
  browser: z.string().nullable().optional().describe("Browser metadata"),
  os: z.string().nullable().optional().describe("OS metadata"),
  country: z.string().nullable().optional().describe("Country metadata"),
  durationSeconds: z.number().nullable().optional().describe("Duration spent on the form"),
  submittedAt: z.union([z.string(), z.date()]).describe("Submitted timestamp"),
});

export const submitFormResponseInput = z.object({
  formId: z.string().describe("Id of the form"),
  slug: z.string().describe("slug of the form"),
  accessKey: z.string().optional().describe("Access key for unlisted forms"),
  answers: z.record(z.string(), z.any()).describe("Submitted answers keyed by field id"),
  browser: z.string().optional().describe("Browser metadata"),
  os: z.string().optional().describe("OS metadata"),
  country: z.string().optional().describe("Country metadata"),
  durationSeconds: z.number().int().min(0).optional().describe("Duration spent on the form"),
});

export type SubmitFormResponseType = z.infer<typeof submitFormResponseInput>;

export const submitFormResponseOutput = z.object({
  id: z.string().describe("Id of the saved response"),
  formId: z.string().describe("Id of the form"),
  responseCount: z.number().describe("Updated response count"),
  submittedAt: z.union([z.string(), z.date()]).describe("Submitted timestamp"),
});

export const getFormResponsesInput = z.object({
  formId: z.string().describe("Id of the form"),
});

export type GetFormResponsesType = z.infer<typeof getFormResponsesInput>;

export const getFormResponsesOutput = z.object({
  formId: z.string().describe("Id of the form"),
  title: z.string().describe("title of the form"),
  slug: z.string().describe("slug of the form"),
  fields: z.array(field).describe("fields on the form"),
  responseCount: z.number().describe("Total responses stored for the form"),
  responses: z.array(responseData).describe("Saved responses for the form"),
});
