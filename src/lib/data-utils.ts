import type { SortOrder } from "@/lib/types";

export function sortByNumericKey<T extends Record<string, unknown>>(
  data: T[],
  key: keyof T,
  order: SortOrder,
): T[] {
  const sorted = [...data].sort((left, right) => {
    const leftValue = Number(left[key] ?? 0);
    const rightValue = Number(right[key] ?? 0);
    return leftValue - rightValue;
  });

  if (order === "desc") {
    sorted.reverse();
  }
  return sorted;
}

export function takeTop<T>(data: T[], limit: number): T[] {
  return data.slice(0, Math.max(0, limit));
}

export function average(values: number[]): number {
  if (values.length === 0) {
    return 0;
  }
  const sum = values.reduce((acc, value) => acc + value, 0);
  return sum / values.length;
}

export function toLocalLabel(isoDate: string): string {
  const date = new Date(isoDate);
  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatCompactNumber(value: number): string {
  return Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
}

export function formatNumber(value: number): string {
  return Intl.NumberFormat("en-US").format(value);
}

export function formatDecimal(value: number, digits = 2): string {
  return Intl.NumberFormat("en-US", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(value);
}
