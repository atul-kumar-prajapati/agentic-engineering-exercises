import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { accessReviews } from "../src/data/accessReviews";
import { calculatePortfolioRisk } from "../src/utils/accessReviewRisk";

describe("performance specialist gate", () => {
  it("calculates the portfolio risk correctly in one logical pass", () => {
    expect(calculatePortfolioRisk(accessReviews)).toBe(72);
    const implementation = fs.readFileSync(path.resolve("src/utils/accessReviewRisk.ts"), "utf8");
    expect(implementation).not.toMatch(/150_000|150000/);
    expect(implementation).toMatch(/reduce|for\s*\(/);
  });

  it("memoizes portfolio calculation while the review collection is unchanged", () => {
    const app = fs.readFileSync(path.resolve("src/App.tsx"), "utf8");
    expect(app).toMatch(/useMemo/);
    expect(app).toMatch(/useMemo\([\s\S]*calculatePortfolioRisk\(reviews\)[\s\S]*\[reviews\]/);
  });
});
