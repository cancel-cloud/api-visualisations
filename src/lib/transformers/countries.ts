import { z } from "zod";

import type { CountryMetric } from "@/lib/types";

const CountrySchema = z.object({
  name: z.object({
    common: z.string(),
  }),
  region: z.string().default("Unknown"),
  population: z.number().nonnegative().default(0),
  area: z.number().nonnegative().default(0),
});

const CountriesSchema = z.array(CountrySchema);

type CountryResponse = z.infer<typeof CountrySchema>;

function normalizeCountry(country: CountryResponse): CountryMetric {
  const area = country.area || 0;
  const population = country.population || 0;
  return {
    name: country.name.common,
    region: country.region || "Unknown",
    population,
    area,
    density: area > 0 ? population / area : 0,
  };
}

export function transformCountries(input: unknown): CountryMetric[] {
  const parsed = CountriesSchema.parse(input);
  return parsed.map(normalizeCountry);
}
