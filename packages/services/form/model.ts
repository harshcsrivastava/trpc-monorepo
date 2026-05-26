import { xid, z } from "zod";

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
