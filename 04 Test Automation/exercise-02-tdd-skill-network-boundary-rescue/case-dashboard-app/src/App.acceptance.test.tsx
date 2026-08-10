import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { describe, expect, it } from "vitest";
import App from "./App";
import { server } from "./test/server";

describe("protected retry acceptance", () => {
  it("sends a new request and recovers after a server failure", async () => {
    let requests = 0;
    server.use(http.get("/api/cases", () => {
      requests += 1;
      if (requests === 1) return HttpResponse.json({ message: "temporary" }, { status: 503 });
      return HttpResponse.json([{ id: "CASE-220", customer: "Recovered Co", owner: "support", summary: "Retry worked", status: "new" }]);
    }));

    render(<App />);
    await screen.findByRole("alert");
    await userEvent.click(screen.getByRole("button", { name: "Retry" }));
    expect(await screen.findByText("Recovered Co")).toBeInTheDocument();
    expect(requests).toBe(2);
  });
});
