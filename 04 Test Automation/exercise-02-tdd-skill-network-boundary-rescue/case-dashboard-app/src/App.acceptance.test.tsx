import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { delay, http, HttpResponse } from "msw";
import { describe, expect, it } from "vitest";
import App from "./App";
import { server } from "./test/server";

describe("protected case dashboard acceptance", () => {
  it("announces loading while the cases request is pending", () => {
    server.use(http.get("/api/cases", async () => {
      await delay("infinite");
      return HttpResponse.json([]);
    }));

    render(<App />);

    expect(screen.getByRole("status")).toHaveTextContent("Loading cases...");
  });

  it("distinguishes a filtered result from an empty server response", async () => {
    const user = userEvent.setup();
    render(<App />);
    await screen.findByText("Northstar Health");

    await user.type(screen.getByRole("textbox", { name: "Filter cases" }), "unknown customer");

    expect(screen.getByText('No cases match "unknown customer".')).toBeInTheDocument();
    expect(screen.queryByText("No cases are assigned yet.")).not.toBeInTheDocument();
  });

  it("sends exactly one new request and recovers after failure", async () => {
    const user = userEvent.setup();
    let requests = 0;
    server.use(http.get("/api/cases", async () => {
      requests += 1;
      if (requests === 1) return HttpResponse.json({ message: "temporary" }, { status: 503 });
      await delay(50);
      return HttpResponse.json([
        { id: "CASE-220", customer: "Recovered Co", owner: "support", summary: "Retry worked", status: "new" },
      ]);
    }));

    render(<App />);
    await screen.findByRole("alert");
    await user.click(screen.getByRole("button", { name: "Retry" }));

    expect(screen.getByRole("status")).toHaveTextContent("Loading cases...");
    expect(await screen.findByText("Recovered Co")).toBeInTheDocument();
    expect(requests).toBe(2);
  });
});
