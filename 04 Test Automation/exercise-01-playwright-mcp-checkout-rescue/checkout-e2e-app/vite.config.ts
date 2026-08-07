import type { IncomingMessage, ServerResponse } from "node:http";
import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";

function checkoutApi(): Plugin {
  let authorizationCount = 0;

  function json(response: ServerResponse, status: number, body: unknown) {
    response.statusCode = status;
    response.setHeader("content-type", "application/json");
    response.end(JSON.stringify(body));
  }

  async function readBody(request: IncomingMessage) {
    const chunks: Buffer[] = [];
    for await (const chunk of request) chunks.push(Buffer.from(chunk));
    return JSON.parse(Buffer.concat(chunks).toString("utf8") || "{}");
  }

  return {
    name: "checkout-api-fixture",
    configureServer(server) {
      server.middlewares.use(async (request, response, next) => {
        if (request.url === "/api/testing/reset" && request.method === "POST") {
          authorizationCount = 0;
          return json(response, 200, { reset: true });
        }
        if (request.url === "/api/tax-quote" && request.method === "POST") {
          await readBody(request);
          setTimeout(() => json(response, 200, { tax: 7.92 }), 180);
          return;
        }
        if (request.url === "/api/payments/authorize" && request.method === "POST") {
          const body = (await readBody(request)) as { cardNumber?: string; total?: number };
          authorizationCount += 1;
          const declined = body.cardNumber?.endsWith("0000") || authorizationCount % 3 === 0;
          return json(response, declined ? 402 : 200, {
            status: declined ? "declined" : "approved",
            authorizationId: declined ? null : `AUTH-${authorizationCount}`,
            total: body.total,
          });
        }
        next();
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), checkoutApi()],
  server: { port: 5173 },
});
