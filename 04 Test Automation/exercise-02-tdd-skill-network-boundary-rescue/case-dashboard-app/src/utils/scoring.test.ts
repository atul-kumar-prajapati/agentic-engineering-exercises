import { describe, expect, it } from "vitest";
import { workItems } from "../data/workItems";
import { calculateRisk, riskLabel, summarizePortfolio } from "./scoring";

describe("scoring utilities", () => {
  it("marks high risk records as critical", () => {
    const score = calculateRisk(workItems[0]);
    expect(riskLabel(score)).toBe("Critical");
  });

  it("summarizes the portfolio", () => {
    expect(summarizePortfolio(workItems).blocked).toBeGreaterThan(0);
  });
});
