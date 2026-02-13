import { NextResponse } from "next/server";

import { getCryptoMarkets } from "@/lib/api-clients/crypto";
import { CACHE_HEADERS, createEnvelope, createErrorEnvelope } from "@/lib/api-response";
import { sortByNumericKey } from "@/lib/data-utils";
import { parseEnum, parseNumber, parseSortOrder, paramsToRecord } from "@/lib/query";
import type { CryptoMetric } from "@/lib/types";

const CURRENCIES = ["usd", "eur"] as const;
const SORT_KEYS = ["market_cap", "price_change_24h", "current_price"] as const;

const SORT_MAP: Record<(typeof SORT_KEYS)[number], keyof CryptoMetric> = {
  market_cap: "market_cap",
  price_change_24h: "price_change_percentage_24h",
  current_price: "current_price",
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const vsCurrency = parseEnum(searchParams.get("vs_currency"), CURRENCIES, "usd");
  const sort = parseEnum(searchParams.get("sort"), SORT_KEYS, "market_cap");
  const order = parseSortOrder(searchParams.get("order"));
  const limit = parseNumber(searchParams.get("limit"), 10, 5, 50);

  const filters = {
    ...paramsToRecord(searchParams),
    vs_currency: vsCurrency,
    sort,
    order,
    limit,
  };

  try {
    const crypto = await getCryptoMarkets(vsCurrency);
    const sorted = sortByNumericKey(crypto, SORT_MAP[sort], order);
    const data = sorted.slice(0, limit);

    return NextResponse.json(createEnvelope<CryptoMetric>("coingecko", data, filters), {
      headers: CACHE_HEADERS,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown server error";
    return NextResponse.json(
      createErrorEnvelope("coingecko", filters, "Failed to load crypto markets", message),
      {
        status: 502,
        headers: CACHE_HEADERS,
      },
    );
  }
}
