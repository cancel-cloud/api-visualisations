import { fetchJson } from "@/lib/api-clients/http";
import { transformCountries } from "@/lib/transformers/countries";
import type { CountryMetric } from "@/lib/types";

const COUNTRIES_URL =
  "https://restcountries.com/v3.1/all?fields=name,region,population,area";

export async function getCountries(): Promise<CountryMetric[]> {
  const payload = await fetchJson<unknown>(COUNTRIES_URL);
  return transformCountries(payload);
}
