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
