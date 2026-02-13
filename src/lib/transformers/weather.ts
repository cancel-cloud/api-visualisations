import { z } from "zod";

import type { WeatherPoint } from "@/lib/types";

const WeatherSchema = z.object({
  hourly: z.object({
    time: z.array(z.string()),
    temperature_2m: z.array(z.number()),
    precipitation_probability: z.array(z.number()),
  }),
});

export function transformWeather(input: unknown): WeatherPoint[] {
  const parsed = WeatherSchema.parse(input);
  const { time, temperature_2m: temperatures, precipitation_probability: precipitation } = parsed.hourly;

  return time.map((timestamp, index) => ({
    time: timestamp,
    temperature_2m: temperatures[index] ?? 0,
    precipitation_probability: precipitation[index] ?? 0,
  }));
}
