import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { EvidencePanel } from "../src/components/EvidencePanel";
import { workItems } from "../src/data/workItems";
import { createEvidenceBundle, serializeEvidenceBundle } from "../src/services/workflowApi";

describe("lane C evidence export", () => {
  it("builds a deterministic JSON evidence bundle", () => {
    const generatedAt = "2026-08-13T09:00:00.000Z";
    const bundle = createEvidenceBundle(workItems[0], ["Policy approval attached"], generatedAt);
    expect(bundle).toMatchObject({
      id: "parall-01",
      owner: "Asha",
      status: "Blocked",
      risk: 100,
      evidence: ["Policy approval attached"],
      generatedAt,
    });
    expect(JSON.parse(serializeEvidenceBundle(bundle))).toEqual(bundle);
  });

  it("offers export only after evidence has been collected", () => {
    const withEvidence = renderToStaticMarkup(
      <EvidencePanel item={workItems[0]} evidence={["Policy approval attached"]} onCollect={async () => undefined} />,
    );
    const withoutEvidence = renderToStaticMarkup(
      <EvidencePanel item={workItems[0]} evidence={[]} onCollect={async () => undefined} />,
    );
    expect(withEvidence).toContain("Export JSON");
    expect(withoutEvidence).not.toContain("Export JSON");
  });
});
