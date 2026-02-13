import type { BaseDatasetBundle, SortOrder } from "@/lib/types";

function hashNumber(input: string) {
  return input.split("").reduce((acc, char, index) => acc + char.charCodeAt(0) * (index + 7), 0);
}

export function toDeterministicCoordinate(value: string) {
  const hash = hashNumber(value);
  const lon = ((hash % 3600) / 10) - 180;
  const lat = (((Math.floor(hash / 3) % 1800) / 10) - 90) * 0.8;
  return [Number(lon.toFixed(2)), Number(lat.toFixed(2))] as const;
}

export function sortByOrder<T>(rows: T[], value: (row: T) => number, order: SortOrder) {
  const sorted = [...rows].sort((left, right) => value(left) - value(right));
  if (order === "desc") {
    sorted.reverse();
  }
  return sorted;
}

export function limitedCountries(bundle: BaseDatasetBundle, limit: number, order: SortOrder) {
  return sortByOrder(bundle.countries, (country) => country.population, order).slice(0, limit);
}

export function limitedWeather(bundle: BaseDatasetBundle, limit: number, order: SortOrder) {
  const sorted = [...bundle.weather].sort((left, right) => {
    const leftValue = new Date(left.time).getTime();
    const rightValue = new Date(right.time).getTime();
    return order === "asc" ? leftValue - rightValue : rightValue - leftValue;
  });
  return sorted.slice(0, limit);
}

export function limitedCrypto(bundle: BaseDatasetBundle, limit: number, order: SortOrder) {
  return sortByOrder(bundle.crypto, (coin) => coin.market_cap, order).slice(0, limit);
}

export function groupedCountriesByRegion(bundle: BaseDatasetBundle, limit: number, order: SortOrder) {
  const countries = limitedCountries(bundle, Math.max(limit, 10), order);
  const groups = new Map<string, { region: string; population: number; countries: typeof countries }>();

  countries.forEach((country) => {
    const entry = groups.get(country.region) ?? {
      region: country.region,
      population: 0,
      countries: [],
    };
    entry.population += country.population;
    entry.countries.push(country);
    groups.set(country.region, entry);
  });

  return [...groups.values()];
}

export function buildTreeData(bundle: BaseDatasetBundle, limit: number, order: SortOrder) {
  const grouped = groupedCountriesByRegion(bundle, limit, order);

  return {
    name: "World",
    children: grouped.map((group) => ({
      name: group.region,
      value: group.population,
      children: group.countries.map((country) => ({
        name: country.name,
        value: country.population,
      })),
    })),
  };
}

export function buildSankeyData(bundle: BaseDatasetBundle, limit: number, order: SortOrder) {
  const grouped = groupedCountriesByRegion(bundle, limit, order);
  const nodes = [{ name: "World" }];
  const links: { source: string; target: string; value: number }[] = [];

  grouped.forEach((group) => {
    nodes.push({ name: group.region });
    links.push({
      source: "World",
      target: group.region,
      value: group.population,
    });

    group.countries.slice(0, 4).forEach((country) => {
      nodes.push({ name: country.name });
      links.push({
        source: group.region,
        target: country.name,
        value: Math.max(1, country.population),
      });
    });
  });

  const uniqueNodes = [...new Map(nodes.map((node) => [node.name, node])).values()];
  return {
    nodes: uniqueNodes,
    links,
  };
}

export function buildGraphData(bundle: BaseDatasetBundle, limit: number, order: SortOrder) {
  const coins = limitedCrypto(bundle, limit, order);
  const nodes = coins.map((coin, index) => ({
    id: coin.symbol,
    name: coin.symbol,
    value: coin.market_cap,
    symbolSize: 14 + Math.min(32, index * 1.3),
  }));

  const links = nodes.slice(1).map((node, index) => ({
    source: nodes[index].id,
    target: node.id,
    value: Math.max(1, Math.abs(coins[index + 1]?.price_change_percentage_24h ?? 1)),
  }));

  return {
    nodes,
    links,
  };
}

export function buildMapPoints(bundle: BaseDatasetBundle, limit: number, order: SortOrder) {
  return limitedCountries(bundle, limit, order).map((country) => {
    const coord = toDeterministicCoordinate(country.name);
    return {
      name: country.name,
      value: [...coord, country.population],
    };
  });
}
