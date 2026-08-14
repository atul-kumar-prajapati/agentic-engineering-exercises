import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { SeverityBadge } from "../../src/components/SeverityBadge";
import type { Incident } from "../../src/data/incidents";
import { calculateSeverity } from "../../src/utils/scoring";

function incident(
  declaredSeverity: Incident["declaredSeverity"],
  inheritedSeverity?: Incident["inheritedSeverity"],
): Incident {
  return {
    id: "INC-ESC-120",
    summary: "Inherited severity regression",
    declaredSeverity,
    inheritedSeverity,
  };
}

describe("ESC-120 inherited severity regression", () => {
  it("uses an inherited severity when it is higher than the declared severity", () => {
    expect(calculateSeverity(incident("Low", "Critical"))).toBe("Critical");
  });

  it("does not let inherited severity lower the declared severity", () => {
    expect(calculateSeverity(incident("High", "Medium"))).toBe("High");
    expect(calculateSeverity(incident("Medium"))).toBe("Medium");
  });

  it("renders the calculated severity in the badge", () => {
    const markup = renderToStaticMarkup(
      <SeverityBadge incident={incident("Low", "Critical")} />,
    );

    expect(markup).toContain('data-severity="Critical"');
    expect(markup).toContain(">Critical<");
  });
});
