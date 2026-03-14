import { CORS_ORIGIN_REGEX } from "./constants";

export function parseCorsOrigins(raw: string): string[] {
  return raw
    .split(",")
    .map((origin) => origin.trim().replace(CORS_ORIGIN_REGEX, ""))
    .filter(Boolean);
}