import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";

function caseApi(): Plugin {
  return {
    name: "case-api-fixture",
    configureServer(server) {
      server.middlewares.use((request, response, next) => {
        if (request.url !== "/api/cases" || request.method !== "GET") return next();
        response.statusCode = 200;
        response.setHeader("content-type", "application/json");
        response.end(JSON.stringify([
          { id: "CASE-104", customer: "Northstar Health", owner: "billing", summary: "Invoice export is blocked", status: "investigating" },
          { id: "CASE-108", customer: "Aster Labs", owner: "identity", summary: "Approver group is missing", status: "new" },
        ]));
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), caseApi()],
  server: { port: 5173 },
});
