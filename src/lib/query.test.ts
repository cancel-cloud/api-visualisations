import { describe, expect, it } from "vitest";

import { parseEnum, parseNumber, parseSortOrder } from "@/lib/query";

describe("query parsing", () => {
  it("falls back for invalid enum", () => {
    expect(parseEnum("x", ["a", "b"] as const, "a")).toBe("a");
    expect(parseEnum("b", ["a", "b"] as const, "a")).toBe("b");
  });

  it("clamps numbers", () => {
    expect(parseNumber("100", 12, 5, 25)).toBe(25);
    expect(parseNumber("2", 12, 5, 25)).toBe(5);
    expect(parseNumber("invalid", 12, 5, 25)).toBe(12);
  });

  it("parses sort order safely", () => {
    expect(parseSortOrder("asc")).toBe("asc");
    expect(parseSortOrder("oops")).toBe("desc");
  });
});
