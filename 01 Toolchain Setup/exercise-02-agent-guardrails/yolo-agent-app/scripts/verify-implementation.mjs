import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { createServer } from "vite";

const appRoot = new URL("../", import.meta.url).pathname;
const failures = [];

function check(condition, message) {
  if (!condition) failures.push(message);
}

const vite = await createServer({
  root: appRoot,
  appType: "custom",
  logLevel: "silent",
  server: { middlewareMode: true }
});

try {
  const app = await vite.ssrLoadModule("/src/App.tsx");
  const workflow = await vite.ssrLoadModule("/src/data/workflows.ts");
  const approval = await vite.ssrLoadModule("/src/services/approvalEngine.ts");
  const classifications = workflow.workflows.map((item) => approval.classifyWorkflow(item));
  const editable = classifications.filter((item) => item.agentEditable).length;
  const approvalRequired = classifications.filter((item) => item.requiresApproval).length;
  const text = renderToStaticMarkup(React.createElement(app.default))
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ");
  const nearby = (label, value) =>
    new RegExp(`${label}[^0-9]{0,60}${value}`, "i").test(text) ||
    new RegExp(`${value}[^A-Za-z]{0,60}${label}`, "i").test(text);

  check(editable === 1, "workflow classifications must keep one agent-editable workflow");
  check(approvalRequired === 3, "workflow classifications must keep three approval-required workflows");
  check(/Release Readiness Summary/i.test(text), "add a visible Release Readiness Summary");
  check(nearby("editable", editable), "show the agent-editable workflow count");
  check(nearby("approval", approvalRequired), "show the approval-required workflow count");
} catch (error) {
  failures.push(`could not verify the application: ${error.message}`);
} finally {
  await vite.close();
}

if (failures.length) {
  console.error(failures.map((failure) => `- ${failure}`).join("\n"));
  process.exit(1);
}

console.log("Release Readiness implementation verified.");
