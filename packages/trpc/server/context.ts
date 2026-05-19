import type {CreateExpressContextOptions} from "@trpc/server/c"

export async function createContext({}) {
  return { developerName: "Harsh Srivastaav" };
}
export type Context = Awaited<ReturnType<typeof createContext>>;
