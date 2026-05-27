import { z } from "zod";

const envSchema = z.object({
  JWT_SECRET: z.string().describe("Secret key for JWT Tokens"),
  HOST_URL: z.string().describe("Base host URL for public links").default("http://localhost:3000"),
});

function createEnv(env: NodeJS.ProcessEnv) {
  const safeParseResult = envSchema.safeParse(env);
  if (!safeParseResult.success) throw new Error(safeParseResult.error.message);
  return safeParseResult.data;
}

export const env = createEnv(process.env);
