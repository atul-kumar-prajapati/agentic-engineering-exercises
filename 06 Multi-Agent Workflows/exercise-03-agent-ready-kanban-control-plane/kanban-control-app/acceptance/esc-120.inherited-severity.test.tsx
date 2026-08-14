import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { SeverityBadge } from "../src/components/SeverityBadge";
import { incidents } from "../src/data/incidents";
import { calculateSeverity } from "../src/utils/scoring";

describe("ESC-120 inherited severity", () => {
  const parent = incidents.find((incident) => incident.id === "INC-120-P")!;
  const child = incidents.find((incident) => incident.id === "INC-120-C")!;

  it("keeps the higher inherited severity without changing independent incidents", () => {
    expect(calculateSeverity(parent)).toBe("Critical");
    expect(calculateSeverity(child)).toBe("Critical");
    expect(calculateSeverity(incidents[2])).toBe("Medium");
  });

  it("renders the calculated inherited severity", () => {
    const markup = renderToStaticMarkup(<SeverityBadge incident={child} />);
    expect(markup).toContain('data-severity="Critical"');
    expect(markup).toContain(">Critical<");
    expect(markup).not.toContain(">Low<");
  });
});
