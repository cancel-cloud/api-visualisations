import { describe, expect, it } from "vitest";

import { transformCountries } from "@/lib/transformers/countries";
import { transformCrypto } from "@/lib/transformers/crypto";
import { transformWeather } from "@/lib/transformers/weather";

describe("transformers", () => {
  it("normalizes countries payload", () => {
    const result = transformCountries([
      {
        name: { common: "Example" },
        region: "Europe",
        population: 100,
        area: 10,
      },
    ]);

    expect(result).toEqual([
      {
        name: "Example",
        region: "Europe",
        population: 100,
        area: 10,
        density: 10,
      },
    ]);
  });

  it("normalizes weather payload", () => {
    const result = transformWeather({
      hourly: {
        time: ["2026-02-12T00:00", "2026-02-12T01:00"],
        temperature_2m: [8.5, 8.2],
        precipitation_probability: [20, 35],
      },
    });

    expect(result[0]).toEqual({
      time: "2026-02-12T00:00",
      temperature_2m: 8.5,
      precipitation_probability: 20,
    });
    expect(result).toHaveLength(2);
  });

  it("normalizes crypto payload", () => {
    const result = transformCrypto([
      {
        id: "bitcoin",
        symbol: "btc",
        name: "Bitcoin",
        image: "https://example.com/btc.png",
        current_price: 60_000,
        market_cap: 1_000_000,
        price_change_percentage_24h: null,
        high_24h: null,
        low_24h: null,
        total_volume: 300_000,
      },
    ]);

    expect(result[0]).toMatchObject({
      symbol: "BTC",
      current_price: 60000,
      high_24h: 60000,
      low_24h: 60000,
    });
  });
});
