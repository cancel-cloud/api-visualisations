import {
  buildSankeyData,
  buildTreeData,
  groupedCountriesByRegion,
  limitedCountries,
  limitedCrypto,
  limitedWeather,
} from "@/lib/datasets/transforms/shared";
import type { BaseDatasetBundle, SortOrder } from "@/lib/types";

export type RechartsBuildResult = {
  description: string;
  payload: Record<string, unknown>;
};

export function buildRechartsData(
  chart: string,
  bundle: BaseDatasetBundle,
  limit: number,
  order: SortOrder,
): RechartsBuildResult {
  const countries = limitedCountries(bundle, limit, order);
  const weather = limitedWeather(bundle, limit, order);
  const crypto = limitedCrypto(bundle, limit, order);

  if (chart === "area-chart" || chart === "line-chart") {
    return {
      description: "Weather timeline dataset",
      payload: {
        rows: weather.map((point) => ({
          label: new Date(point.time).toLocaleTimeString("en-US", { hour: "2-digit" }),
          temperature: point.temperature_2m,
          precipitation: point.precipitation_probability,
        })),
      },
    };
  }

  if (chart === "bar-chart") {
    return {
      description: "Country population comparison",
      payload: {
        rows: countries.map((country) => ({
          name: country.name,
          population: country.population,
          density: country.density,
        })),
      },
    };
  }

  if (chart === "composed-chart") {
    return {
      description: "Combined population and weather index",
      payload: {
        rows: countries.map((country, index) => ({
          name: country.name,
          population: country.population,
          weatherIndex: weather[index % weather.length]?.temperature_2m ?? 0,
        })),
      },
    };
  }

  if (chart === "pie-chart") {
    return {
      description: "Crypto market-cap composition",
      payload: {
        rows: crypto.map((coin) => ({
          name: coin.symbol,
          value: coin.market_cap,
        })),
      },
    };
  }

  if (chart === "radar-chart") {
    return {
      description: "Regional density radar",
      payload: {
        rows: groupedCountriesByRegion(bundle, limit, order).map((group) => ({
          region: group.region,
          density:
            group.countries.reduce((acc, country) => acc + country.density, 0) /
            Math.max(1, group.countries.length),
        })),
      },
    };
  }

  if (chart === "radial-bar-chart") {
    return {
      description: "24h change by symbol",
      payload: {
        rows: crypto.map((coin) => ({
          name: coin.symbol,
          value: Math.max(1, Math.abs(coin.price_change_percentage_24h)),
          fill: coin.price_change_percentage_24h >= 0 ? "#0f766e" : "#b91c1c",
        })),
      },
    };
  }

  if (chart === "scatter-chart") {
    return {
      description: "Country area and population scatter",
      payload: {
        rows: countries.map((country) => ({
          name: country.name,
          x: country.area / 1000,
          y: country.population / 1_000_000,
          z: Math.max(6, Math.min(20, Math.sqrt(country.density))),
        })),
      },
    };
  }

  if (chart === "funnel-chart") {
    return {
      description: "Synthetic funnel from market data",
      payload: {
        rows: [
          { name: "Awareness", value: crypto[0]?.market_cap ?? 1 },
          { name: "Interest", value: Math.round((crypto[0]?.market_cap ?? 1) * 0.72) },
          { name: "Intent", value: Math.round((crypto[0]?.market_cap ?? 1) * 0.46) },
          { name: "Action", value: Math.round((crypto[0]?.market_cap ?? 1) * 0.24) },
        ],
      },
    };
  }

  if (chart === "treemap" || chart === "sunburst-chart") {
    return {
      description: "Hierarchy built from regions and countries",
      payload: {
        tree: buildTreeData(bundle, limit, order),
      },
    };
  }

  return {
    description: "Sankey links from world to region to countries",
    payload: buildSankeyData(bundle, limit, order),
  };
}
