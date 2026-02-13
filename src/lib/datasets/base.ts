"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import type {
  ApiEnvelope,
  BaseDatasetBundle,
  ChartDatasetKey,
  CoffeeCheckin,
  CountryMetric,
  CryptoMetric,
  WeatherPoint,
} from "@/lib/types";

type BundleState = {
  data: BaseDatasetBundle;
  error: string | null;
  isLoading: boolean;
  isRefreshing: boolean;
};

const EMPTY_BUNDLE: BaseDatasetBundle = {
  countries: [],
  weather: [],
  crypto: [],
  coffee: [],
};

function normalizeEnvelope<T>(payload: ApiEnvelope<T>): T[] {
  if (payload.error) {
    throw new Error(payload.error.message);
  }
  return payload.data;
}

function endpointsFor(dataset: ChartDatasetKey) {
  if (dataset === "countries") {
    return ["/api/countries?region=all&sort=population&order=desc&limit=30"];
  }
  if (dataset === "weather") {
    return ["/api/weather?lat=52.52&lon=13.41&metric=temperature_2m&hours=72&sort=time&order=asc"];
  }
  if (dataset === "crypto") {
    return ["/api/crypto?vs_currency=usd&sort=market_cap&order=desc&limit=30"];
  }
  if (dataset === "coffee") {
    return ["/api/coffee"];
  }
  return [
    "/api/countries?region=all&sort=population&order=desc&limit=30",
    "/api/weather?lat=52.52&lon=13.41&metric=temperature_2m&hours=72&sort=time&order=asc",
    "/api/crypto?vs_currency=usd&sort=market_cap&order=desc&limit=30",
  ];
}

export function useDatasetBundle(dataset: ChartDatasetKey) {
  const [retryTick, setRetryTick] = useState(0);
  const [state, setState] = useState<BundleState>({
    data: EMPTY_BUNDLE,
    error: null,
    isLoading: true,
    isRefreshing: false,
  });

  useEffect(() => {
    let mounted = true;
    const controller = new AbortController();
    const endpoints = endpointsFor(dataset);

    setState((current) => ({
      ...current,
      error: null,
      isLoading: retryTick === 0,
      isRefreshing: retryTick > 0,
    }));

    async function load() {
      try {
        const responses = await Promise.all(
          endpoints.map((endpoint) =>
            fetch(endpoint, {
              signal: controller.signal,
              cache: "no-store",
            }),
          ),
        );

        const payloads = await Promise.all(responses.map((response) => response.json()));

        const nextBundle: BaseDatasetBundle = {
          countries: [],
          weather: [],
          crypto: [],
          coffee: [],
        };

        payloads.forEach((payload, index) => {
          const endpoint = endpoints[index];
          if (endpoint.includes("/api/countries")) {
            nextBundle.countries = normalizeEnvelope(payload as ApiEnvelope<CountryMetric>);
          }
          if (endpoint.includes("/api/weather")) {
            nextBundle.weather = normalizeEnvelope(payload as ApiEnvelope<WeatherPoint>);
          }
          if (endpoint.includes("/api/crypto")) {
            nextBundle.crypto = normalizeEnvelope(payload as ApiEnvelope<CryptoMetric>);
          }
          if (endpoint.includes("/api/coffee")) {
            nextBundle.coffee = normalizeEnvelope(payload as ApiEnvelope<CoffeeCheckin>);
          }
        });

        if (!mounted) {
          return;
        }

        setState({
          data: nextBundle,
          error: null,
          isLoading: false,
          isRefreshing: false,
        });
      } catch (error) {
        if (!mounted || (error instanceof Error && error.name === "AbortError")) {
          return;
        }

        setState((current) => ({
          ...current,
          error: error instanceof Error ? error.message : "Failed to fetch chart data",
          isLoading: false,
          isRefreshing: false,
        }));
      }
    }

    void load();

    return () => {
      mounted = false;
      controller.abort();
    };
  }, [dataset, retryTick]);

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
