import { z } from "zod";

export const createFormWithTitleAndDescriptionInput = z.object({
  creatorId: z.string().describe("Id of the user"),
  title: z.string().describe("title of the form"),
  description: z.string().describe("description of the form"),
});

export type CreateFormWithTitleAndDescriptionType = z.infer<
  typeof createFormWithTitleAndDescriptionInput
>;
