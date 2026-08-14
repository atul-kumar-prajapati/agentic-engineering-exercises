import type { IncomingMessage, ServerResponse } from "node:http";
import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";

function checkoutApi(): Plugin {
  const authorizationCounts = new Map<string, number>();

  function checkoutSession(request: IncomingMessage) {
    const value = request.headers["x-checkout-session"];
    return typeof value === "string" && value.trim() ? value : "default";
  }

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
          const session = checkoutSession(request);
          authorizationCounts.set(session, 0);
          return json(response, 200, { reset: true, session });
        }
        if (request.url === "/api/tax-quote" && request.method === "POST") {
          await readBody(request);
          setTimeout(() => json(response, 200, { tax: 7.92 }), 900);
          return;
        }
        if (request.url === "/api/payments/authorize" && request.method === "POST") {
          const body = (await readBody(request)) as { cardNumber?: string; total?: number };
          const session = checkoutSession(request);
          const authorizationCount = (authorizationCounts.get(session) ?? 0) + 1;
          authorizationCounts.set(session, authorizationCount);
          const declined = body.cardNumber?.endsWith("0000") || authorizationCount % 3 === 0;
          setTimeout(
            () =>
              json(response, declined ? 402 : 200, {
                status: declined ? "declined" : "approved",
                authorizationId: declined ? null : `AUTH-${session}-${authorizationCount}`,
                total: body.total,
              }),
            900,
          );
          return;
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
