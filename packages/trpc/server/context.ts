import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
// jab bhi express call karega ye use req, res ka access dedega
import { createCookieFactory, getCookieFactory, clearCookieFactory } from "./utils/cookie";

export interface TRPCContext {
  createCookie: ReturnType<typeof createCookieFactory>;
  getCookie: ReturnType<typeof getCookieFactory>;
  clearCookie: ReturnType<typeof clearCookieFactory>;
}

export async function createContext({
  req,
  res,
}: CreateExpressContextOptions): Promise<TRPCContext> {
  // promise of this type return karega

  // is req, res ko returnnn kar skta hhuh
  // but ideally only jo needed hho vhi return krdo
  const ctx: TRPCContext = {
    createCookie: createCookieFactory(res),
    getCookie: getCookieFactory(req),
    clearCookie: clearCookieFactory(res),
  };
  return ctx;
}
export type Context = Awaited<ReturnType<typeof createContext>>;
