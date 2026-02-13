import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const pages = ["/", "/libraries/chartjs", "/libraries/recharts", "/libraries/echarts"];

for (const path of pages) {
  test(`${path} has no serious accessibility violations`, async ({ page }) => {
    await page.goto(path);

    const report = await new AxeBuilder({ page }).analyze();
    const seriousOrCritical = report.violations.filter(
      (violation) => violation.impact === "serious" || violation.impact === "critical",
    );

    expect(seriousOrCritical).toEqual([]);
  });
}
