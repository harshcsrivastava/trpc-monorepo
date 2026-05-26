import { createHmac } from "crypto";

export function hashWithSalt(value: string, salt: string) {
  return createHmac("sha256", salt).update(value).digest("hex");
}
