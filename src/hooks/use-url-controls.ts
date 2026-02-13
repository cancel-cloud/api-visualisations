"use client";

import { useCallback } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

export function useUrlControls() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();

  const setParam = useCallback(
    (key: string, value: string | number) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set(key, String(value));
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [pathname, router, searchParams],
  );

  const getParam = useCallback(
    (key: string, fallback: string) => {
      return searchParams.get(key) ?? fallback;
    },
    [searchParams],
  );

  const getNumberParam = useCallback(
    (key: string, fallback: number, min: number, max: number) => {
      const raw = searchParams.get(key);
      if (raw === null) {
        return fallback;
      }
      const parsed = Number(raw);
      if (Number.isNaN(parsed)) {
        return fallback;
      }
      return Math.max(min, Math.min(max, parsed));
    },
    [searchParams],
  );

  return {
    getNumberParam,
    getParam,
    paramsKey: searchParams.toString(),
    setParam,
  };
}
