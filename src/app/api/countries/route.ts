import { NextResponse } from "next/server";

import { getCountries } from "@/lib/api-clients/countries";
import { CACHE_HEADERS, createEnvelope, createErrorEnvelope } from "@/lib/api-response";
import { sortByNumericKey } from "@/lib/data-utils";
import { parseEnum, parseNumber, parseSortOrder, paramsToRecord } from "@/lib/query";
import type { CountryMetric } from "@/lib/types";

const REGIONS = ["all", "Africa", "Americas", "Asia", "Europe", "Oceania"] as const;
const SORT_KEYS = ["population", "area", "density"] as const;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const region = parseEnum(searchParams.get("region"), REGIONS, "all");
  const sort = parseEnum(searchParams.get("sort"), SORT_KEYS, "population");
  const order = parseSortOrder(searchParams.get("order"));
  const limit = parseNumber(searchParams.get("limit"), 12, 5, 50);

  const filters = {
    ...paramsToRecord(searchParams),
    region,
    sort,
    order,
    limit,
  };

  try {
    const countries = await getCountries();
    const filtered =
      region === "all" ? countries : countries.filter((country) => country.region === region);
    const sorted = sortByNumericKey(filtered, sort, order);
    const data = sorted.slice(0, limit);

    return NextResponse.json(createEnvelope<CountryMetric>("restcountries", data, filters), {
      headers: CACHE_HEADERS,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown server error";
    return NextResponse.json(
      createErrorEnvelope("restcountries", filters, "Failed to load countries", message),
      {
        status: 502,
        headers: CACHE_HEADERS,
      },
    );
  }
}
