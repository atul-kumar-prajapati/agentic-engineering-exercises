import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { MetricStrip } from "../src/components/MetricStrip";
import { workItems } from "../src/data/workItems";
import { calculateRisk, riskLabel, summarizePortfolio } from "../src/utils/scoring";

describe("lane B SLA risk", () => {
  it("counts work due today and keeps a due-today blocked item critical", () => {
    const summary = summarizePortfolio(workItems);
    expect(summary.dueToday).toBe(1);
    expect(riskLabel(calculateRisk(workItems[0]))).toBe("Critical");
  });

  it("renders the due-today portfolio metric", () => {
    const markup = renderToStaticMarkup(<MetricStrip summary={summarizePortfolio(workItems)} />);
    expect(markup).toContain("Due today");
  });
});
