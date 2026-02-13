import { expect, test } from "@playwright/test";

const countriesPayload = {
  source: "test",
  lastUpdated: new Date("2026-02-13T00:00:00.000Z").toISOString(),
  data: [
    { name: "Alpha", region: "Europe", population: 1200, area: 40, density: 30 },
    { name: "Beta", region: "Asia", population: 800, area: 20, density: 40 },
    { name: "Gamma", region: "Americas", population: 700, area: 35, density: 20 },
    { name: "Delta", region: "Africa", population: 650, area: 28, density: 22 },
  ],
  meta: { total: 4, filters: {} },
};

const weatherPayload = {
  source: "test",
  lastUpdated: new Date("2026-02-13T00:00:00.000Z").toISOString(),
  data: Array.from({ length: 24 }, (_, index) => ({
    time: `2026-02-13T${String(index).padStart(2, "0")}:00`,
    temperature_2m: 4 + index * 0.4,
    precipitation_probability: (index * 7) % 100,
  })),
  meta: { total: 24, filters: {} },
};

const cryptoPayload = {
  source: "test",
  lastUpdated: new Date("2026-02-13T00:00:00.000Z").toISOString(),
  data: [
    {
      id: "bitcoin",
      symbol: "BTC",
      name: "Bitcoin",
      image: "https://example.com/btc.png",
      current_price: 60000,
      market_cap: 1200000,
      price_change_percentage_24h: 3.5,
      high_24h: 62000,
      low_24h: 59000,
      total_volume: 500000,
    },
    {
      id: "ethereum",
      symbol: "ETH",
      name: "Ethereum",
      image: "https://example.com/eth.png",
      current_price: 3200,
      market_cap: 550000,
      price_change_percentage_24h: -1.3,
      high_24h: 3400,
      low_24h: 3000,
      total_volume: 260000,
    },
  ],
  meta: { total: 2, filters: {} },
};

const coffeePayload = {
  source: "test",
  lastUpdated: new Date("2026-02-13T00:00:00.000Z").toISOString(),
  data: [
    {
      id: "c1",
      createdAt: "2026-02-10T07:00:00.000Z",
      boardId: "coffee-id",
      boardName: "Coffee",
      isEspresso: true,
      gapToPrevSeconds: null,
    },
    {
      id: "c2",
      createdAt: "2026-02-10T07:00:30.000Z",
      boardId: "coffee-id",
      boardName: "Coffee",
      isEspresso: true,
      gapToPrevSeconds: 30,
    },
    {
      id: "c3",
      createdAt: "2026-02-11T14:10:00.000Z",
      boardId: "coffee-id",
      boardName: "Coffee",
      isEspresso: false,
      gapToPrevSeconds: 11100,
    },
    {
      id: "c4",
      createdAt: "2026-02-12T19:22:00.000Z",
      boardId: "coffee-id",
      boardName: "Coffee",
      isEspresso: false,
      gapToPrevSeconds: 105120,
    },
  ],
  meta: { total: 4, filters: {} },
};

test.beforeEach(async ({ page }) => {
  await page.route("**/api/countries**", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(countriesPayload),
    });
  });

  await page.route("**/api/weather**", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(weatherPayload),
    });
  });

  await page.route("**/api/crypto**", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(cryptoPayload),
    });
  });

  await page.route("**/api/coffee**", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(coffeePayload),
    });
  });
});

test("homepage exposes all three chart library hubs", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Three chart libraries");
  await expect(page.locator('a[href="/libraries/chartjs"]')).toBeVisible();
  await expect(page.locator('a[href="/libraries/recharts"]')).toBeVisible();
  await expect(page.locator('a[href="/libraries/echarts"]')).toBeVisible();
});

test("navigates library indexes and sample chart pages", async ({ page }) => {
  await page.goto("/");

  await page.locator('a[href="/libraries/chartjs"]').first().click();
  await expect(page).toHaveURL(/\/libraries\/chartjs$/);
  await page.locator('a[href="/libraries/chartjs/line"]').click();
  await expect(page).toHaveURL(/\/libraries\/chartjs\/line/);

  await page.getByLabel("Sort order").selectOption("asc");
  await expect(page).toHaveURL(/order=asc/);

  await page.goto("/libraries/recharts");
  await page.locator('a[href="/libraries/recharts/area-chart"]').click();
  await expect(page).toHaveURL(/\/libraries\/recharts\/area-chart/);

  await page.goto("/libraries/echarts");
  await page.locator('a[href="/libraries/echarts/line"]').click();
  await expect(page).toHaveURL(/\/libraries\/echarts\/line/);
});

test("legacy demo links redirect to new library routes", async ({ page }) => {
  await page.goto("/demo/countries-bar");
  await expect(page).toHaveURL(/\/libraries\/chartjs\/bar/);
});

test("echarts dashboard renders multi-panel charts and scenario URL state", async ({ page }) => {
  await page.goto("/libraries/echarts/dashboard");

  await expect(page.getByRole("heading", { level: 1, name: "Global Risk Dashboard" })).toBeVisible();
  await expect(page.getByRole("heading", { level: 2, name: "Global Operations Scenario" })).toBeVisible();
  await expect(page.getByRole("heading", { level: 3, name: "Risk Signal Timeline" })).toBeVisible();
  await expect(page.getByRole("heading", { level: 3, name: "Regional Share" })).toBeVisible();

  await page.getByLabel("Scenario").selectOption("economics");
  await expect(page).toHaveURL(/metric=economics/);

  await page.getByLabel("Sort order").selectOption("asc");
  await expect(page).toHaveURL(/order=asc/);
});

test("coffee dashboard renders charts, URL-synced filters, and espresso table rows", async ({ page }) => {
  await page.goto("/libraries/echarts/coffee-dashboard");

  await expect(page.getByRole("heading", { level: 1, name: "Coffee Log Dashboard" })).toBeVisible();
  await expect(page.getByRole("heading", { level: 2, name: "Espresso Cluster Analysis" })).toBeVisible();
  await expect(page.getByRole("heading", { level: 3, name: "Normal vs Espresso Timeline" })).toBeVisible();
  await expect(page.getByRole("heading", { level: 3, name: "Coffee Table (Accessible Fallback)" })).toBeVisible();

  await page.getByLabel("Date range").selectOption("30d");
  await expect(page).toHaveURL(/range=30d/);

  await page.getByLabel("Weekday filter").selectOption("weekdays");
  await expect(page).toHaveURL(/weekday=weekdays/);

  await expect(page.getByText("Espresso").first()).toBeVisible();
});
