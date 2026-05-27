import { z } from "zod";

export const createFormWithTitleAndDescriptionInputModel = z.object({
  title: z
    .string()
    .describe("title of the form")
    .min(4, "Must be atleast 4 characters.")
    .nonoptional(),
  description: z
    .string()
    .describe("description of the form")
    .min(4, "Must be atleast 4 characters.")
    .nonoptional(),
});

export const createFormWithTitleAndDescriptionOutputModel = z.object({
  id: z.string().describe("id of the form"),
});

export const getFormsDataByUserIdInputModel = z.object({
  pageSize: z
    .number()
    .describe("current page size to display forms")
    .min(1, "Page Size is required"),
  page: z.number().describe("current page number of the user").min(1, "Page Number is required"),
  // optional search term to filter forms by title/description
  search: z.string().optional(),
});

export const formRowOutputModel = z.object({
  formId: z.string().describe("Unique ID of the form"),
  creatorName: z.string().describe("Full name of the creator"),
  formTitle: z.string().describe("Title of the form"),
  formDescription: z.string().nullable().describe("Description of the form"),
  responseCount: z.number().describe("Number of responses submitted"),
  visibility: z.string().describe("Visibility status of the form"),
  // slug may be missing in some rows; accept optional
  slug: z.string().optional().describe("slug for form"),
  // updatedAt can be a Date or ISO string depending on DB driver/serialization
  updatedAt: z.union([z.string(), z.date()]).describe("Last updated timestamp"),
  count: z.number().describe("Total number of forms for this user"),
});

export const getFormsDataByUserIdOutputModel = z.object({
  forms: z.array(formRowOutputModel).describe("List of forms created by the user"),
  metaData: z.object({
    start: z.number().describe("Starting index of the current page"),
    end: z.number().describe("Ending index of the current page"),
    totalCount: z.number().describe("Total number of forms"),
  }),
});

export const getFormByIdInputModel = z.object({
  formId: z.string().describe("Id of the form"),
});

export const getFormByIdInput = getFormByIdInputModel;
export type GetFormByIdType = z.infer<typeof getFormByIdInputModel>;

export const getFormByIdOutputModel = z.object({
  id: z.string().describe("Id of the form"),
  title: z.string().describe("Title of the form"),
  description: z.string().nullable().describe("Description of the form"),
  slug: z.string().describe("Slug of the form"),
  accessKey: z.string().nullable().optional().describe("Access key for the form"),
  redirectUrl: z.string().describe("Redirect URL for the form"),
  fields: z.array(z.any()).describe("Fields stored on the form"),
  logic: z.array(z.any()).describe("Conditional logic stored on the form"),
  visibility: z.enum(["public", "unlisted", "draft"]).describe("Visibility status of the form"),
  responseCount: z.number().nullable().optional().describe("Response count stored on the form"),
  expiresAt: z.union([z.string(), z.date()]).nullable().optional().describe("Expiry timestamp"),
  updatedAt: z.union([z.string(), z.date()]).describe("Last updated timestamp"),
});

export const getPublicFormByIdInputModel = z.object({
  formId: z.string().describe("Id of the form"),
  slug: z.string().describe("slug of the form"),
  accessKey: z.string().optional().describe("Access key for unlisted forms"),
});

export const publicFormOutputModel = getFormByIdOutputModel.extend({
  requiresAccessKey: z.boolean(),
  redirectUrl: z.string(),
});

export const getPublicFormByIdOutputModel = publicFormOutputModel;

export const setFormAccessKeyInputModel = z.object({
  formId: z.string().describe("Id of the form"),
  accessKey: z.string().optional().describe("Access key to store for the form"),
});

export const setFormAccessKeyOutputModel = z.object({
  id: z.string().describe("Id of the form"),
  visibility: z.enum(["public", "unlisted", "draft"]),
  accessKey: z.string().describe("Stored access key"),
  redirectUrl: z.string().describe("Public redirect URL for the form").nullable(),
  updatedAt: z.union([z.string(), z.date()]).describe("Last updated timestamp"),
});

export const updateFormMetadataInputModel = z.object({
  formId: z.string().describe("Id of the form"),
  title: z.string().describe("title of the form"),
  description: z.string().optional().describe("description of the form"),
  visibility: z.enum(["public", "unlisted", "draft"]).optional().describe("visibility of the form"),
});

export const updateFormMetadataOutputModel = z.object({
  id: z.string().describe("Id of the form"),
  title: z.string().describe("title of the form"),
  description: z.string().nullable().describe("description of the form"),
  slug: z.string().describe("slug of the form"),
  visibility: z.enum(["public", "unlisted", "draft"]).describe("visibility of the form"),
  // redirectUrl: z.string().nullable().describe("Redirect URL for the form"),
});

export const updateFormSettingsInputModel = z.object({
  formId: z.string().describe("Id of the form"),
  title: z.string().describe("title of the form"),
  description: z.string().optional().describe("description of the form"),
  visibility: z.enum(["public", "unlisted", "draft"]).describe("visibility of the form"),
  accessKey: z.string().optional().describe("access key for the form"),
  responseCount: z.number().int().min(0).optional().describe("response count for the form"),
  expiresAt: z.union([z.string(), z.date()]).nullable().optional().describe("expiry timestamp"),
});

export const updateFormSettingsOutputModel = z.object({
  id: z.string().describe("Id of the form"),
  title: z.string().describe("title of the form"),
  description: z.string().nullable().describe("description of the form"),
  slug: z.string().describe("slug of the form"),
  visibility: z.enum(["public", "unlisted", "draft"]).describe("visibility of the form"),
  accessKey: z.string().nullable().optional().describe("access key for the form"),
  responseCount: z.number().nullable().optional().describe("response count for the form"),
  expiresAt: z.date().nullable().optional().describe("expiry timestamp"),
  updatedAt: z.date().nullable().describe("Last updated timestamp"),
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

export const createFormFieldsInputModel = z.object({
  id: z.string().describe("Id of the form"),
  field: field.describe("Field to be added"),
  logic: z
    .array(
      z.object({
        fieldId: z.string(),
        dependsOnFieldId: z.string(),
        operator: z.enum(["equals", "not_equals", "contains", "greater_than", "less_than"]),
        value: z.any(),
        action: z.enum(["show", "hide"]),
      }),
    )
    .optional()
    .describe("optional conditional logic rules"),
});
export const createFormFieldsOutputModel = z.object({
  formId: z.string().describe("form id"),
  fields: z.array(z.any()).describe("array of fields"),
  logic: z
    .array(
      z.object({
        fieldId: z.string(),
        dependsOnFieldId: z.string(),
        operator: z.enum(["equals", "not_equals", "contains", "greater_than", "less_than"]),
        value: z.any(),
        action: z.enum(["show", "hide"]),
      }),
    )
    .optional()
    .describe("conditional logic rules saved with the form")
    .nullable(),
});

export const updateFormFieldsInputModel = z.object({
  formId: z.string().describe("Id of the form"),
  fields: z.array(field).describe("fields to set on the form"),
  logic: z
    .array(
      z.object({
        fieldId: z.string(),
        dependsOnFieldId: z.string(),
        operator: z.enum(["equals", "not_equals", "contains", "greater_than", "less_than"]),
        value: z.any(),
        action: z.enum(["show", "hide"]),
      }),
    )
    .optional()
    .describe("optional conditional logic rules"),
});

export const updateFormFieldsOutputModel = z.object({
  formId: z.string().describe("form id"),
  fields: z.array(z.any()).describe("array of fields"),
  logic: z
    .array(
      z.object({
        fieldId: z.string(),
        dependsOnFieldId: z.string(),
        operator: z.enum(["equals", "not_equals", "contains", "greater_than", "less_than"]),
        value: z.any(),
        action: z.enum(["show", "hide"]),
      }),
    )
    .optional()
    .describe("conditional logic rules saved with the form")
    .nullable(),
});

export const publishFormInputModel = z.object({
  formId: z.string().describe("Id of the form"),
  title: z.string().describe("title of the form"),
  description: z.string().optional().describe("description of the form"),
  fields: z.array(field).describe("fields to save on the form"),
  logic: z
    .array(
      z.object({
        fieldId: z.string(),
        dependsOnFieldId: z.string(),
        operator: z.enum(["equals", "not_equals", "contains", "greater_than", "less_than"]),
        value: z.any(),
        action: z.enum(["show", "hide"]),
      }),
    )
    .optional()
    .describe("optional conditional logic rules"),
});

export const publishFormOutputModel = getFormByIdOutputModel.extend({
  redirectUrl: z.string().describe("Public redirect URL for the published form"),
  accessKey: z.string().nullable().optional().describe("Access key, if any"),
});

export const responseData = z.object({
  id: z.string().describe("Id of the response"),
  answers: z.record(z.string(), z.any()).describe("Submitted answers keyed by field id"),
  browser: z.string().nullable().optional().describe("Browser metadata"),
  os: z.string().nullable().optional().describe("OS metadata"),
  country: z.string().nullable().optional().describe("Country metadata"),
  durationSeconds: z.number().nullable().optional().describe("Duration spent on the form"),
  submittedAt: z.union([z.string(), z.date()]).describe("Submitted timestamp"),
});

export const submitFormResponseInputModel = z.object({
  formId: z.string().describe("Id of the form"),
  slug: z.string().describe("slug of the form"),
  accessKey: z.string().optional().describe("Access key for unlisted forms"),
  answers: z.record(z.string(), z.any()).describe("Submitted answers keyed by field id"),
  browser: z.string().optional().describe("Browser metadata"),
  os: z.string().optional().describe("OS metadata"),
  country: z.string().optional().describe("Country metadata"),
  durationSeconds: z.number().int().min(0).optional().describe("Duration spent on the form"),
});

export const submitFormResponseOutputModel = z.object({
  id: z.string().describe("Id of the saved response"),
  formId: z.string().describe("Id of the form"),
  responseCount: z.number().describe("Updated response count"),
  submittedAt: z.union([z.string(), z.date()]).describe("Submitted timestamp"),
});

export const getFormResponsesInputModel = z.object({
  formId: z.string().describe("Id of the form"),
});

export const getFormResponsesOutputModel = z.object({
  formId: z.string().describe("Id of the form"),
  title: z.string().describe("title of the form"),
  slug: z.string().describe("slug of the form"),
  fields: z.array(field).describe("fields on the form"),
  responseCount: z.number().describe("Total responses stored for the form"),
  responses: z.array(responseData).describe("Saved responses for the form"),
});
