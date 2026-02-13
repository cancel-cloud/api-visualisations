import { fetchJson } from "@/lib/api-clients/http";
import { transformWeather } from "@/lib/transformers/weather";
import type { WeatherPoint } from "@/lib/types";

export async function getWeather(lat: number, lon: number): Promise<WeatherPoint[]> {
  const url = new URL("https://api.open-meteo.com/v1/forecast");
  url.searchParams.set("latitude", String(lat));
  url.searchParams.set("longitude", String(lon));
  url.searchParams.set("hourly", "temperature_2m,precipitation_probability");
  url.searchParams.set("forecast_days", "3");
  const payload = await fetchJson<unknown>(url.toString());
  return transformWeather(payload);
}
