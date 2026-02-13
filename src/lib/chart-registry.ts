"use client";

import {
  ArcElement,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Filler,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  RadialLinearScale,
  Tooltip,
} from "chart.js";

let registered = false;
let registrationPromise: Promise<void> | null = null;

export async function registerCharts() {
  if (registered) {
    return;
  }

  if (!registrationPromise) {
    registrationPromise = (async () => {
      const [{ default: chartDataLabels }, { default: zoomPlugin }] = await Promise.all([
        import("chartjs-plugin-datalabels"),
        import("chartjs-plugin-zoom"),
      ]);

      ChartJS.register(
        CategoryScale,
        LinearScale,
        RadialLinearScale,
        BarElement,
        LineElement,
        PointElement,
        ArcElement,
        Tooltip,
        Legend,
        Filler,
        chartDataLabels,
        zoomPlugin,
      );

      registered = true;
    })();
  }

  await registrationPromise;
}
