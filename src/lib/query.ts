import type { SortOrder } from "@/lib/types";

export function parseEnum<T extends string>(
  value: string | null,
  allowed: readonly T[],
  fallback: T,
): T {
  if (!value) {
    return fallback;
  }
  return allowed.includes(value as T) ? (value as T) : fallback;
}

export function parseNumber(
  value: string | null,
  fallback: number,
  min: number,
  max: number,
): number {
  if (!value) {
    return fallback;
  }
  const parsed = Number(value);
  if (Number.isNaN(parsed)) {
    return fallback;
  }
  return Math.max(min, Math.min(max, parsed));
}

export function parseSortOrder(value: string | null, fallback: SortOrder = "desc"): SortOrder {
  return parseEnum(value, ["asc", "desc"] as const, fallback);
}

export function paramsToRecord(searchParams: URLSearchParams): Record<string, string | number> {
  const output: Record<string, string | number> = {};
  for (const [key, value] of searchParams.entries()) {
    output[key] = value;
  }
  return output;
}

export function encodeUrl(pathname: string, values: Record<string, string | number>): string {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(values)) {
    params.set(key, String(value));
  }
  return `${pathname}?${params.toString()}`;
}
