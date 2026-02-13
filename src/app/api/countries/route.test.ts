import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";

import { GET } from "@/app/api/countries/route";

const originalFetch = global.fetch;

describe("GET /api/countries", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.restoreAllMocks();
    global.fetch = originalFetch;
  });

  it("returns envelope and applies sorting/filtering defaults", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(
        JSON.stringify([
          { name: { common: "B" }, region: "Europe", population: 300, area: 30 },
          { name: { common: "A" }, region: "Europe", population: 600, area: 20 },
          { name: { common: "C" }, region: "Asia", population: 200, area: 20 },
        ]),
        { status: 200 },
      ),
    );

    const request = new Request(
      "http://localhost/api/countries?region=Europe&sort=population&order=desc&limit=2",
    );
    const response = await GET(request);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(response.headers.get("Cache-Control")).toContain("s-maxage=300");
    expect(body.data).toHaveLength(2);
    expect(body.data[0].name).toBe("A");
    expect(body.meta.filters.region).toBe("Europe");
  });

  it("returns structured error when upstream fails", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(JSON.stringify({ error: "bad" }), {
        status: 500,
        statusText: "Server Error",
      }),
    );

    const request = new Request("http://localhost/api/countries");
    const response = await GET(request);
    const body = await response.json();

    expect(response.status).toBe(502);
    expect(body.error.message).toBe("Failed to load countries");
    expect(typeof body.error.details).toBe("string");
  });
});
