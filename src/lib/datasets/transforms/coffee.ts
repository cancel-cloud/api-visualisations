import type { CoffeeCheckin, SortOrder } from "@/lib/types";

export type CoffeeDashboardRange = "30d" | "90d" | "365d" | "all";
export type CoffeeDashboardGranularity = "day" | "week" | "month";
export type CoffeeDashboardWeekday = "all" | "weekdays" | "weekends" | "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun";
export type CoffeeDashboardDaypart = "all" | "morning" | "afternoon" | "evening" | "night";

export type CoffeeDashboardFilters = {
  daypart: CoffeeDashboardDaypart;
  granularity: CoffeeDashboardGranularity;
  range: CoffeeDashboardRange;
  weekday: CoffeeDashboardWeekday;
};

type BucketPoint = {
  espresso: number;
  label: string;
  normal: number;
  total: number;
  ts: number;
};

type CoffeeEntry = {
  boardId: string;
  createdAt: string;
  id: string;
};

export type CoffeeDashboardModel = {
  filtered: CoffeeCheckin[];
  hourly: Array<{ count: number; hour: number }>;
  insight: {
    closeEventEntries: number;
    clusterEvents: number;
    largestCluster: number;
  };
  kpis: {
    averagePerDay: number;
    espressoCount: number;
    espressoRatio: number;
    normalCount: number;
    total: number;
  };
  monthly: BucketPoint[];
  tableRows: CoffeeCheckin[];
  timeSeries: BucketPoint[];
  weekday: Array<{ count: number; label: string }>;
};

const WEEKDAY_KEYS: Array<Exclude<CoffeeDashboardWeekday, "all" | "weekdays" | "weekends">> = [
  "sun",
  "mon",
  "tue",
  "wed",
  "thu",
  "fri",
  "sat",
];
const WEEKDAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const RANGE_TO_DAYS: Record<Exclude<CoffeeDashboardRange, "all">, number> = {
  "30d": 30,
  "90d": 90,
  "365d": 365,
};

function toEpoch(value: string) {
  const epoch = Date.parse(value);
  if (Number.isNaN(epoch)) {
    throw new Error(`Invalid timestamp: ${value}`);
  }
  return epoch;
}

function startOfDayEpoch(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
}

function dayKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function monthKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function startOfIsoWeek(date: Date) {
  const clone = new Date(date);
  const day = clone.getDay();
  const distanceToMonday = day === 0 ? 6 : day - 1;
  clone.setDate(clone.getDate() - distanceToMonday);
  clone.setHours(0, 0, 0, 0);
  return clone;
}

function weekKey(date: Date) {
  const start = startOfIsoWeek(date);
  return `${start.getFullYear()}-${String(start.getMonth() + 1).padStart(2, "0")}-${String(start.getDate()).padStart(2, "0")}`;
}

function inDaypart(date: Date, filter: CoffeeDashboardDaypart) {
  if (filter === "all") {
    return true;
  }

  const hour = date.getHours();
  if (filter === "morning") {
    return hour >= 5 && hour <= 11;
  }
  if (filter === "afternoon") {
    return hour >= 12 && hour <= 16;
  }
  if (filter === "evening") {
    return hour >= 17 && hour <= 21;
  }
  return hour >= 22 || hour <= 4;
}

function inWeekday(date: Date, filter: CoffeeDashboardWeekday) {
  if (filter === "all") {
    return true;
  }
  const weekday = date.getDay();
  if (filter === "weekdays") {
    return weekday >= 1 && weekday <= 5;
  }
  if (filter === "weekends") {
    return weekday === 0 || weekday === 6;
  }
  return WEEKDAY_KEYS[weekday] === filter;
}

function sortByCreatedAt(checkins: CoffeeCheckin[]) {
  return [...checkins].sort((left, right) => toEpoch(left.createdAt) - toEpoch(right.createdAt));
}

function aggregateTimeSeries(
  checkins: CoffeeCheckin[],
  granularity: CoffeeDashboardGranularity,
  order: SortOrder,
  limit: number,
) {
  const points = new Map<string, BucketPoint>();

  checkins.forEach((checkin) => {
    const date = new Date(checkin.createdAt);
    const label = granularity === "day" ? dayKey(date) : granularity === "week" ? weekKey(date) : monthKey(date);
    const ts = granularity === "day" ? startOfDayEpoch(date) : granularity === "week" ? startOfIsoWeek(date).getTime() : new Date(date.getFullYear(), date.getMonth(), 1).getTime();
    const current = points.get(label) ?? { label, total: 0, espresso: 0, normal: 0, ts };
    current.total += 1;
    if (checkin.isEspresso) {
      current.espresso += 1;
    } else {
      current.normal += 1;
    }
    points.set(label, current);
  });

  const sorted = [...points.values()].sort((left, right) => left.ts - right.ts);
  if (order === "desc") {
    sorted.reverse();
  }
  return sorted.slice(0, Math.max(6, Math.min(48, limit)));
}

function aggregateMonths(checkins: CoffeeCheckin[], order: SortOrder) {
  const points = new Map<string, BucketPoint>();

  checkins.forEach((checkin) => {
    const date = new Date(checkin.createdAt);
    const label = monthKey(date);
    const ts = new Date(date.getFullYear(), date.getMonth(), 1).getTime();
    const current = points.get(label) ?? { label, total: 0, espresso: 0, normal: 0, ts };
    current.total += 1;
    if (checkin.isEspresso) {
      current.espresso += 1;
    } else {
      current.normal += 1;
    }
    points.set(label, current);
  });

  const sorted = [...points.values()].sort((left, right) => left.ts - right.ts);
  if (order === "desc") {
    sorted.reverse();
  }
  return sorted;
}

function aggregateHours(checkins: CoffeeCheckin[]) {
  const hourMap = new Array<number>(24).fill(0);
  checkins.forEach((checkin) => {
    hourMap[new Date(checkin.createdAt).getHours()] += 1;
  });
  return hourMap.map((count, hour) => ({ hour, count }));
}

function aggregateWeekdays(checkins: CoffeeCheckin[]) {
  const weekdayMap = new Array<number>(7).fill(0);
  checkins.forEach((checkin) => {
    weekdayMap[new Date(checkin.createdAt).getDay()] += 1;
  });
  return WEEKDAY_LABELS.map((label, index) => ({
    label,
    count: weekdayMap[index],
  }));
}

function buildClusterInsight(checkins: CoffeeCheckin[]) {
  const sorted = sortByCreatedAt(checkins);
  if (sorted.length === 0) {
    return {
      clusterEvents: 0,
      largestCluster: 0,
      closeEventEntries: 0,
    };
  }

  let clusterStart = 0;
  let clusterEvents = 0;
  let largestCluster = 1;
  let closeEventEntries = 0;

  for (let index = 0; index < sorted.length; index += 1) {
    const isLast = index === sorted.length - 1;
    const nextGap = !isLast ? toEpoch(sorted[index + 1].createdAt) - toEpoch(sorted[index].createdAt) : Number.POSITIVE_INFINITY;

    if (isLast || nextGap > 60_000) {
      const clusterSize = index - clusterStart + 1;
      if (clusterSize >= 2) {
        clusterEvents += 1;
        closeEventEntries += clusterSize;
      }
      largestCluster = Math.max(largestCluster, clusterSize);
      clusterStart = index + 1;
    }
  }

  return {
    clusterEvents,
    largestCluster,
    closeEventEntries,
  };
}

export function classifyCoffeeCheckins(entries: CoffeeEntry[]): CoffeeCheckin[] {
  const sorted = [...entries]
    .map((entry) => ({
      ...entry,
      epoch: toEpoch(entry.createdAt),
    }))
    .sort((left, right) => left.epoch - right.epoch || left.id.localeCompare(right.id));

  const espressoFlags = new Array<boolean>(sorted.length).fill(false);
  let clusterStart = 0;

  for (let index = 0; index < sorted.length; index += 1) {
    const isLast = index === sorted.length - 1;
    const nextGap = !isLast ? sorted[index + 1].epoch - sorted[index].epoch : Number.POSITIVE_INFINITY;

    if (isLast || nextGap > 60_000) {
      if (index - clusterStart + 1 >= 2) {
        for (let pointer = clusterStart; pointer <= index; pointer += 1) {
          espressoFlags[pointer] = true;
        }
      }
      clusterStart = index + 1;
    }
  }

  return sorted.map((entry, index) => ({
    id: entry.id,
    createdAt: new Date(entry.epoch).toISOString(),
    boardId: entry.boardId,
    boardName: "Coffee",
    isEspresso: espressoFlags[index],
    gapToPrevSeconds: index === 0 ? null : Math.round((entry.epoch - sorted[index - 1].epoch) / 1000),
  }));
}

export function filterCoffeeCheckins(checkins: CoffeeCheckin[], filters: Pick<CoffeeDashboardFilters, "daypart" | "range" | "weekday">) {
  if (checkins.length === 0) {
    return [];
  }

  const sorted = sortByCreatedAt(checkins);
  const latest = toEpoch(sorted[sorted.length - 1].createdAt);

  const cutoff =
    filters.range === "all"
      ? Number.NEGATIVE_INFINITY
      : latest - RANGE_TO_DAYS[filters.range] * 24 * 60 * 60 * 1000;

  return sorted.filter((checkin) => {
    const created = toEpoch(checkin.createdAt);
    if (created < cutoff) {
      return false;
    }
    const date = new Date(created);
    return inWeekday(date, filters.weekday) && inDaypart(date, filters.daypart);
  });
}

export function buildCoffeeDashboardModel(
  checkins: CoffeeCheckin[],
  filters: CoffeeDashboardFilters,
  order: SortOrder,
  limit: number,
): CoffeeDashboardModel {
  const filtered = filterCoffeeCheckins(checkins, {
    range: filters.range,
    weekday: filters.weekday,
    daypart: filters.daypart,
  });

  const espressoCount = filtered.filter((item) => item.isEspresso).length;
  const total = filtered.length;
  const normalCount = total - espressoCount;
  const uniqueDays = new Set(filtered.map((item) => dayKey(new Date(item.createdAt)))).size;
  const averagePerDay = uniqueDays === 0 ? 0 : total / uniqueDays;
  const espressoRatio = total === 0 ? 0 : espressoCount / total;

  const tableRows = [...filtered]
    .sort((left, right) => toEpoch(left.createdAt) - toEpoch(right.createdAt))
    .slice(0, Math.max(8, Math.min(120, limit * 4)));

  if (order === "desc") {
    tableRows.reverse();
  }

  return {
    filtered,
    kpis: {
      total,
      espressoCount,
      normalCount,
      espressoRatio,
      averagePerDay,
    },
    timeSeries: aggregateTimeSeries(filtered, filters.granularity, order, limit),
    hourly: aggregateHours(filtered),
    weekday: aggregateWeekdays(filtered),
    monthly: aggregateMonths(filtered, order),
    insight: buildClusterInsight(filtered),
    tableRows,
  };
}
