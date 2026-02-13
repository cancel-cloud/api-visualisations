import { describe, expect, it } from "vitest";

import {
  buildCoffeeDashboardModel,
  classifyCoffeeCheckins,
  filterCoffeeCheckins,
} from "@/lib/datasets/transforms/coffee";

describe("coffee transforms", () => {
  it("classifies close clusters as espresso including same-time and one-minute entries", () => {
    const rows = classifyCoffeeCheckins([
      { id: "a", boardId: "coffee", createdAt: "2026-02-10T10:00:00.000Z" },
      { id: "b", boardId: "coffee", createdAt: "2026-02-10T10:00:30.000Z" },
      { id: "c", boardId: "coffee", createdAt: "2026-02-10T10:01:00.000Z" },
      { id: "d", boardId: "coffee", createdAt: "2026-02-10T10:03:01.000Z" },
      { id: "e", boardId: "coffee", createdAt: "2026-02-10T10:04:00.000Z" },
      { id: "f", boardId: "coffee", createdAt: "2026-02-10T10:05:00.000Z" },
      { id: "g", boardId: "coffee", createdAt: "2026-02-10T10:06:02.000Z" },
    ]);

    expect(rows.map((row) => row.isEspresso)).toEqual([true, true, true, true, true, true, false]);
    expect(rows.map((row) => row.gapToPrevSeconds)).toEqual([null, 30, 30, 121, 59, 60, 62]);
  });

  it("keeps entries normal when gaps are greater than one minute", () => {
    const rows = classifyCoffeeCheckins([
      { id: "a", boardId: "coffee", createdAt: "2026-02-10T09:00:00.000Z" },
      { id: "b", boardId: "coffee", createdAt: "2026-02-10T09:01:01.000Z" },
    ]);

    expect(rows[0].isEspresso).toBe(false);
    expect(rows[1].isEspresso).toBe(false);
  });

  it("builds deterministic dashboard output and applies filters", () => {
    const classified = classifyCoffeeCheckins([
      { id: "a", boardId: "coffee", createdAt: "2026-02-01T06:00:00.000Z" },
      { id: "b", boardId: "coffee", createdAt: "2026-02-01T06:00:25.000Z" },
      { id: "c", boardId: "coffee", createdAt: "2026-02-02T13:00:00.000Z" },
      { id: "d", boardId: "coffee", createdAt: "2026-02-03T19:30:00.000Z" },
      { id: "e", boardId: "coffee", createdAt: "2026-02-04T23:30:00.000Z" },
    ]);

    const filtered = filterCoffeeCheckins(classified, {
      range: "all",
      weekday: "all",
      daypart: "morning",
    });
    expect(filtered.length).toBeGreaterThan(0);

    const first = buildCoffeeDashboardModel(
      classified,
      {
        range: "all",
        granularity: "day",
        weekday: "all",
        daypart: "all",
      },
      "desc",
      12,
    );
    const second = buildCoffeeDashboardModel(
      classified,
      {
        range: "all",
        granularity: "day",
        weekday: "all",
        daypart: "all",
      },
      "desc",
      12,
    );

    expect(first).toEqual(second);
    expect(first.kpis.total).toBe(5);
    expect(first.kpis.espressoCount).toBe(2);
    expect(first.insight.clusterEvents).toBe(1);
  });
});
