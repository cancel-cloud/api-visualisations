import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("node:fs/promises", () => ({
  readFile: vi.fn(),
}));

import { readFile } from "node:fs/promises";

import { GET } from "@/app/api/coffee/route";

const HEADER =
  "entity,board_id,board_name,board_amountKind,board_defaultAmount,board_createdAt,checkin_id,checkin_boardId,checkin_amount,checkin_note,checkin_createdAt";

describe("GET /api/coffee", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns envelope with espresso cluster classification", async () => {
    vi.mocked(readFile).mockResolvedValueOnce(
      [
        HEADER,
        'Board,coffee-id,"Coffee",,,2024-07-27T07:43:52Z,,,,,',
        "Checkin,,,,,,one,coffee-id,,,2026-02-10T10:00:00Z",
        "Checkin,,,,,,two,coffee-id,,,2026-02-10T10:00:30Z",
        "Checkin,,,,,,three,coffee-id,,,2026-02-10T10:03:00Z",
      ].join("\n"),
    );

    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(response.headers.get("Cache-Control")).toContain("s-maxage=300");
    expect(body.source).toBe("local-csv");
    expect(body.meta.filters.boardName).toBe("Coffee");
    expect(body.data).toHaveLength(3);
    expect(body.data.map((item: { id: string; isEspresso: boolean }) => [item.id, item.isEspresso])).toEqual([
      ["one", true],
      ["two", true],
      ["three", false],
    ]);
  });

  it("returns structured error when coffee board is missing", async () => {
    vi.mocked(readFile).mockResolvedValueOnce(
      [
        HEADER,
        'Board,other-id,"Pushy",,,2025-11-13T06:52:22Z,,,,,',
        "Checkin,,,,,,one,other-id,,,2026-02-10T10:00:00Z",
      ].join("\n"),
    );

    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(502);
    expect(body.error.message).toBe("Failed to load coffee checkins");
    expect(body.error.details).toContain("Coffee board not found");
  });

  it("returns structured error when timestamp is malformed", async () => {
    vi.mocked(readFile).mockResolvedValueOnce(
      [
        HEADER,
        'Board,coffee-id,"Coffee",,,2024-07-27T07:43:52Z,,,,,',
        "Checkin,,,,,,one,coffee-id,,,bad-time",
      ].join("\n"),
    );

    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(502);
    expect(body.error.message).toBe("Failed to load coffee checkins");
    expect(body.error.details).toContain("Invalid timestamp");
  });
});
