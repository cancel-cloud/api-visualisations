import { fetchJson } from "@/lib/api-clients/http";
import { transformCrypto } from "@/lib/transformers/crypto";
import type { CryptoMetric } from "@/lib/types";

export async function getCryptoMarkets(vsCurrency: "usd" | "eur"): Promise<CryptoMetric[]> {
  const url = new URL("https://api.coingecko.com/api/v3/coins/markets");
  url.searchParams.set("vs_currency", vsCurrency);
  url.searchParams.set("order", "market_cap_desc");
  url.searchParams.set("per_page", "50");
  url.searchParams.set("page", "1");
  url.searchParams.set("sparkline", "false");
  const payload = await fetchJson<unknown>(url.toString());
  return transformCrypto(payload);
}
