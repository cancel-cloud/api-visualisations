import type { ApiEnvelope } from "@/lib/types";

export function createEnvelope<T>(
  source: string,
  data: T[],
  filters: Record<string, string | number>,
): ApiEnvelope<T> {
  return {
    source,
    lastUpdated: new Date().toISOString(),
    data,
    meta: {
      total: data.length,
      filters,
    },
  };
}

export function createErrorEnvelope(
  source: string,
  filters: Record<string, string | number>,
  message: string,
  details?: string,
): ApiEnvelope<never> {
  return {
    source,
    lastUpdated: new Date().toISOString(),
    data: [],
    meta: {
      total: 0,
      filters,
    },
    error: {
      message,
      details,
    },
  };
}

export const CACHE_HEADERS = {
  "Cache-Control": "s-maxage=300, stale-while-revalidate=600",
};
