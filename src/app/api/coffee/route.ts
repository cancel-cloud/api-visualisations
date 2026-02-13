import path from "node:path";
import { readFile } from "node:fs/promises";
import { NextResponse } from "next/server";
import { parse } from "csv-parse/sync";

import { CACHE_HEADERS, createEnvelope, createErrorEnvelope } from "@/lib/api-response";
import { classifyCoffeeCheckins } from "@/lib/datasets/transforms/coffee";
import type { CoffeeCheckin } from "@/lib/types";

type CsvRow = {
  board_id: string;
  board_name: string;
  checkin_boardId: string;
  checkin_createdAt: string;
  checkin_id: string;
  entity: string;
};

const DATA_FILE = "text-8A02DB514049-1.csv";

function parseCsv(content: string): CsvRow[] {
  return parse(content, {
    columns: true,
    skip_empty_lines: true,
    bom: true,
    relax_column_count: true,
  }) as CsvRow[];
}

function resolveCoffeeBoard(rows: CsvRow[]) {
  const board = rows.find((row) => row.entity === "Board" && row.board_name === "Coffee");
  if (!board?.board_id) {
    throw new Error("Coffee board not found in CSV");
  }
  return board.board_id;
}

function toCoffeeCheckins(rows: CsvRow[]): CoffeeCheckin[] {
  const coffeeBoardId = resolveCoffeeBoard(rows);
  const entries = rows
    .filter((row) => row.entity === "Checkin" && row.checkin_boardId === coffeeBoardId)
    .map((row) => ({
      id: row.checkin_id,
      createdAt: row.checkin_createdAt,
      boardId: coffeeBoardId,
    }));

  return classifyCoffeeCheckins(entries);
}

export const runtime = "nodejs";

export async function GET() {
  const filters = {
    boardName: "Coffee",
    file: DATA_FILE,
  };

  try {
    const csvPath = path.join(process.cwd(), "data", DATA_FILE);
    const csvContent = await readFile(csvPath, "utf-8");
    const rows = parseCsv(csvContent);
    const coffeeCheckins = toCoffeeCheckins(rows);

    return NextResponse.json(createEnvelope<CoffeeCheckin>("local-csv", coffeeCheckins, filters), {
      headers: CACHE_HEADERS,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown server error";
    return NextResponse.json(
      createErrorEnvelope("local-csv", filters, "Failed to load coffee checkins", message),
      {
        status: 502,
        headers: CACHE_HEADERS,
      },
    );
  }
}
