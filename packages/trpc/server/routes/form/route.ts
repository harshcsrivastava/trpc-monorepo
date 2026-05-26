import { formService } from "../../services";
import { authenticatedProcedure, router } from "../../trpc";
import { generatePath } from "../../utils/path-generator";
import {
  createFormWithTitleAndDescriptionInputModel,
  createFormWithTitleAndDescriptionOutputModel,
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
});
