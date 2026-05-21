import { userService } from "../../services";
import { publicProcedure, router } from "../../trpc";
import { setAuthenticationCookie } from "../../utils/cookie";
import { generatePath } from "../../utils/path-generator";
import {
  createUserWithEmailAndPasswordInputModel,
  createUserWithEmailAndPasswordOutputModel,
} from "./model";
// import {} from "@repo/services/user"
// service ko aise nhi usse kr sskte object banana padega
// to hum trpc/services/index.ts ke andar ki userService use krenge

const TAGS = ["Authentication"];
const getPath = generatePath("/authentication");

export const authRouter = router({
  createUserWithEmailAndPassword: publicProcedure
    .meta({
      openapi: {
        method: "POST", // agar kisiko RequestKit sse karna hai to vo POST call kare, usually Procedure call hongi
        path: getPath("/createUsserWithEmailAndPassword"),
        tags: TAGS,
      },
    })
    .input(createUserWithEmailAndPasswordInputModel)
    .output(createUserWithEmailAndPasswordOutputModel)
    .mutation(async ({ input, ctx }) => {
      const { fullName, email, password } = input;
      const { id, token } = await userService.createUserWithEmailAndPassword({
        fullName,
        email,
        password,
      });

      setAuthenticationCookie(ctx, token); // ghuma ke kaam kiya || Full Abstractionn
      return {
        id,
      };
    }), // handlerFunction == mutation
});
