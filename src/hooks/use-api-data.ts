"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import type { ApiEnvelope } from "@/lib/types";

type UseApiDataState<T> = {
  data: ApiEnvelope<T> | null;
  error: string | null;
  isLoading: boolean;
  isRefreshing: boolean;
};

const INITIAL_STATE: UseApiDataState<never> = {
  data: null,
  error: null,
  isLoading: true,
  isRefreshing: false,
};

export function useApiData<T>(endpoint: string) {
  const [state, setState] = useState<UseApiDataState<T>>(INITIAL_STATE);
  const [retryTick, setRetryTick] = useState(0);

  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();

    setState((current) => ({
      ...current,
      isLoading: current.data === null,
      isRefreshing: current.data !== null,
      error: null,
    }));

    async function run() {
      try {
        const response = await fetch(endpoint, {
          signal: controller.signal,
          cache: "no-store",
        });

        const payload = (await response.json()) as ApiEnvelope<T>;
        if (!response.ok || payload.error) {
          throw new Error(payload.error?.message ?? "Request failed");
        }

        if (!isMounted) {
          return;
        }

        setState({
          data: payload,
          error: null,
          isLoading: false,
          isRefreshing: false,
        });
      } catch (error) {
        if (!isMounted || (error instanceof Error && error.name === "AbortError")) {
          return;
        }

        setState((current) => ({
          ...current,
          error: error instanceof Error ? error.message : "Unexpected error",
          isLoading: false,
          isRefreshing: false,
        }));
      }
    }

    void run();

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [endpoint, retryTick]);

  const retry = useCallback(() => {
    setRetryTick((value) => value + 1);
  }, []);

  return useMemo(
    () => ({
      ...state,
      retry,
    }),
    [retry, state],
  );
}
