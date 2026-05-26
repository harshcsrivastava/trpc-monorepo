import { formService } from "../../services";
import { authenticatedProcedure, router } from "../../trpc";
import { generatePath } from "../../utils/path-generator";
import {
  createFormWithTitleAndDescriptionInputModel,
  createFormWithTitleAndDescriptionOutputModel,
  getFormsDataByUserIdInputModel,
  getFormsDataByUserIdOutputModel,
} from "./model";

const TAGS = ["Forms"];
const getPath = generatePath("/form");

export const formRouter = router({
  createFormWithTitleAndDescription: authenticatedProcedure
    .meta({
      openapi: {
        method: "POST", // agar kisiko RequestKit sse karna hai to vo POST call kare, usually Procedure call hongi
        path: getPath("/createFormWithTitleAndDescription"),
        tags: TAGS,
      },
    })
    .input(createFormWithTitleAndDescriptionInputModel)
    .output(createFormWithTitleAndDescriptionOutputModel)
    .mutation(async ({ input, ctx }) => {
      const { title, description } = input;
      const creatorId = ctx.user.id;
      const { id } = await formService.createFormWithTitleAndDescription({
        creatorId,
        title,
        description,
      });

      return {
        id,
      };
    }),
  getFormsDataByUserId: authenticatedProcedure
    .meta({
      openapi: {
        method: "GET",
        path: getPath("/getFormsDataByUserId"),
        tags: TAGS,
      },
    })
    .input(getFormsDataByUserIdInputModel)
    .output(getFormsDataByUserIdOutputModel)
    .query(async ({ input, ctx }) => {
      const id = ctx.user.id;
      const { pageSize, page } = input;

      const { forms, metaData } = await formService.getFormsDataByUserId({
        id,
        pageSize,
        page,
      });

      return {
        forms,
        metaData,
      };
    }),
});
