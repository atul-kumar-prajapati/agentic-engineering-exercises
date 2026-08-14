import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const source = await readFile(new URL("./workflowApi.ts", import.meta.url), "utf8");
const implementation = source
  .slice(source.indexOf("export function createEvidenceBundle"))
  .replaceAll("export ", "")
  .replaceAll('item: WorkItem, evidence: string[]', "item, evidence")
  .replaceAll('bundle: EvidenceBundle', "bundle")
  .replaceAll('): EvidenceBundle', ")")
  .replaceAll('): string', ")");

let clicked = false;
let revokedUrl;
let downloadedAs;

class FakeBlob {
  constructor(parts, options) {
    this.parts = parts;
    this.type = options.type;
  }
}

const fakeUrl = {
  createObjectURL(blob) {
    assert.equal(blob.type, "application/json");
    return "blob:evidence";
  },
  revokeObjectURL(url) {
    revokedUrl = url;
  },
};

const fakeDocument = {
  createElement(tag) {
    assert.equal(tag, "a");
    return {
      set href(value) {
        assert.equal(value, "blob:evidence");
      },
      set download(value) {
        downloadedAs = value;
      },
      click() {
        clicked = true;
      },
    };
  },
};

const loadImplementation = new Function(
  "calculateRisk",
  "Blob",
  "URL",
  "document",
  `${implementation}\nreturn { createEvidenceBundle, serializeEvidenceBundle, downloadEvidenceBundle };`,
);
const api = loadImplementation(() => 87, FakeBlob, fakeUrl, fakeDocument);
const evidence = ["Owner confirmed", "Approval attached"];
const item = { id: "parall-02", owner: "Mateo", status: "In Review" };
const expected = {
  id: "parall-02",
  owner: "Mateo",
  status: "In Review",
  calculatedRisk: 87,
  evidence: ["Owner confirmed", "Approval attached"],
};

const bundle = api.createEvidenceBundle(item, evidence);
assert.deepEqual(bundle, expected);
evidence.push("Mutation after export");
assert.deepEqual(bundle.evidence, ["Owner confirmed", "Approval attached"]);
assert.deepEqual(JSON.parse(api.serializeEvidenceBundle(bundle)), expected);

assert.deepEqual(api.downloadEvidenceBundle(item, bundle.evidence), expected);
assert.equal(downloadedAs, "parall-02-evidence.json");
assert.equal(clicked, true);
assert.equal(revokedUrl, "blob:evidence");

console.log("Evidence bundle export contract passed");
