import type { ChartStylePreset } from "@/lib/types";

export type ChartVisualPreset = {
  name: string;
  surface: string;
  axis: string;
  text: string;
  colors: string[];
};

const PRESETS: Record<ChartStylePreset, ChartVisualPreset> = {
  minimal: {
    name: "Minimal",
    surface: "rgba(243, 244, 246, 0.7)",
    axis: "rgba(17, 24, 39, 0.15)",
    text: "#111827",
    colors: ["#2563EB", "#16A34A", "#F97316", "#DB2777", "#0891B2"],
  },
  bold: {
    name: "Bold",
    surface: "rgba(255, 237, 213, 0.6)",
    axis: "rgba(124, 45, 18, 0.28)",
    text: "#431407",
    colors: ["#EA580C", "#0F766E", "#1D4ED8", "#BE123C", "#7C3AED"],
  },
  editorial: {
    name: "Editorial",
    surface: "rgba(254, 252, 232, 0.9)",
    axis: "rgba(113, 63, 18, 0.24)",
    text: "#422006",
    colors: ["#A16207", "#0369A1", "#B45309", "#047857", "#7C2D12"],
  },
};

export function resolvePreset(value: string | null): ChartStylePreset {
  if (value === "minimal" || value === "bold" || value === "editorial") {
    return value;
  }
  return "bold";
}

export function getPreset(preset: ChartStylePreset): ChartVisualPreset {
  return PRESETS[preset];
}

export const PRESET_OPTIONS = [
  { label: "Minimal", value: "minimal" },
  { label: "Bold", value: "bold" },
  { label: "Editorial", value: "editorial" },
];
