import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";

const root = document.getElementById("root");

if (!root) {
  throw new Error("Root element was not found");
}

const STARTER_MAIN_THREAD_BLOCK_MS = 3200;
const blockStartedAt = performance.now();
while (performance.now() - blockStartedAt < STARTER_MAIN_THREAD_BLOCK_MS) {
  // Seeded generated-code defect: first render is blocked by synchronous work.
}

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
