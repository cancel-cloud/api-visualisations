import { z } from "zod";

import type { CryptoMetric } from "@/lib/types";

const CryptoAssetSchema = z.object({
  id: z.string(),
  symbol: z.string(),
  name: z.string(),
  image: z.string().url(),
  current_price: z.number().default(0),
  market_cap: z.number().default(0),
  price_change_percentage_24h: z.number().nullable().default(0),
  high_24h: z.number().nullable().default(0),
  low_24h: z.number().nullable().default(0),
  total_volume: z.number().default(0),
});

const CryptoSchema = z.array(CryptoAssetSchema);

type CryptoResponse = z.infer<typeof CryptoAssetSchema>;

function normalizeAsset(asset: CryptoResponse): CryptoMetric {
  return {
    id: asset.id,
    symbol: asset.symbol.toUpperCase(),
    name: asset.name,
    image: asset.image,
    current_price: asset.current_price,
    market_cap: asset.market_cap,
    price_change_percentage_24h: asset.price_change_percentage_24h ?? 0,
    high_24h: asset.high_24h ?? asset.current_price,
    low_24h: asset.low_24h ?? asset.current_price,
    total_volume: asset.total_volume,
  };
}

export function transformCrypto(input: unknown): CryptoMetric[] {
  const parsed = CryptoSchema.parse(input);
  return parsed.map(normalizeAsset);
}
