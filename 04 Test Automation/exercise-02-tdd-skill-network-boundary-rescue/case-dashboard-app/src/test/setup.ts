import "@testing-library/jest-dom/vitest";
import { afterAll, beforeAll } from "vitest";
import { server } from "./server";

// Intentionally weak starter setup: learners must make unhandled requests fail
// and reset handlers after every test.
beforeAll(() => server.listen({ onUnhandledRequest: "warn" }));
afterAll(() => server.close());
