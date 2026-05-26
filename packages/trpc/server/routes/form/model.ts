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
