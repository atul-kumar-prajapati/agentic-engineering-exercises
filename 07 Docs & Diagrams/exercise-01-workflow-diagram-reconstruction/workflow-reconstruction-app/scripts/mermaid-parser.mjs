import { JSDOM } from "jsdom";

let mermaidPromise;

async function loadMermaid() {
  if (!mermaidPromise) {
    const dom = new JSDOM("<!doctype html><html><body></body></html>");
    globalThis.window = dom.window;
    globalThis.document = dom.window.document;
    globalThis.Element = dom.window.Element;
    globalThis.Node = dom.window.Node;
    mermaidPromise = import("mermaid").then((module) => module.default);
  }
  return mermaidPromise;
}

export async function parseMermaid(source) {
  const mermaid = await loadMermaid();
  return mermaid.parse(source, { suppressErrors: false });
}
