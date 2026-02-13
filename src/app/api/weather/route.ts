import { NextResponse } from "next/server";

import { getWeather } from "@/lib/api-clients/weather";
import { CACHE_HEADERS, createEnvelope, createErrorEnvelope } from "@/lib/api-response";
import { sortByNumericKey } from "@/lib/data-utils";
import { parseEnum, parseNumber, parseSortOrder, paramsToRecord } from "@/lib/query";
import type { WeatherPoint } from "@/lib/types";

const METRICS = ["temperature_2m", "precipitation_probability"] as const;
const SORT_KEYS = ["time", "value"] as const;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const lat = parseNumber(searchParams.get("lat"), 52.52, -90, 90);
  const lon = parseNumber(searchParams.get("lon"), 13.41, -180, 180);
  const metric = parseEnum(searchParams.get("metric"), METRICS, "temperature_2m");
  const hours = parseNumber(searchParams.get("hours"), 36, 12, 72);
  const sort = parseEnum(searchParams.get("sort"), SORT_KEYS, "time");
  const order = parseSortOrder(searchParams.get("order"));

  const filters = {
    ...paramsToRecord(searchParams),
    lat,
    lon,
    metric,
    hours,
    sort,
    order,
  };

  try {
    const weather = await getWeather(lat, lon);
    const windowed = weather.slice(0, hours);

    const sorted =
      sort === "time"
        ? [...windowed].sort((left, right) => {
            const leftValue = new Date(left.time).getTime();
            const rightValue = new Date(right.time).getTime();
            return order === "asc" ? leftValue - rightValue : rightValue - leftValue;
          })
        : sortByNumericKey(windowed, metric, order);

    return NextResponse.json(createEnvelope<WeatherPoint>("open-meteo", sorted, filters), {
      headers: CACHE_HEADERS,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown server error";
    return NextResponse.json(
      createErrorEnvelope("open-meteo", filters, "Failed to load weather", message),
      {
        status: 502,
        headers: CACHE_HEADERS,
      },
    );
  }
}
