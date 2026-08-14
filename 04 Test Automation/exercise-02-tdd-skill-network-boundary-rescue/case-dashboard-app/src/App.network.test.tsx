import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { delay, http, HttpResponse } from "msw";
import { describe, expect, it } from "vitest";
import App from "./App";
import { server } from "./test/server";

describe("case dashboard network states", () => {
  it("announces loading while GET /api/cases is pending", () => {
    server.use(
      http.get("/api/cases", async () => {
        await delay("infinite");
        return HttpResponse.json([]);
      }),
    );

    render(<App />);

    expect(screen.getByRole("status")).toHaveTextContent("Loading cases...");
  });

  it("shows a filtered-empty message without sending another request", async () => {
    const user = userEvent.setup();
    let requests = 0;
    server.use(
      http.get("/api/cases", () => {
        requests += 1;
        return HttpResponse.json([
          {
            id: "CASE-104",
            customer: "Northstar Health",
            owner: "billing",
            summary: "Invoice export is blocked",
            status: "investigating",
          },
        ]);
      }),
    );

    render(<App />);
    await screen.findByText("Northstar Health");

    await user.type(screen.getByRole("textbox", { name: "Filter cases" }), "unknown customer");

    expect(requests).toBe(1);
    expect(screen.getByText('No cases match "unknown customer".')).toBeInTheDocument();
    expect(screen.queryByText("No cases are assigned yet.")).not.toBeInTheDocument();
  });

  it("sends exactly one retry request and recovers", async () => {
    const user = userEvent.setup();
    let requests = 0;
    server.use(
      http.get("/api/cases", async () => {
        requests += 1;
        if (requests === 1) {
          return HttpResponse.json({ message: "temporary" }, { status: 503 });
        }
        await delay(50);
        return HttpResponse.json([
          {
            id: "CASE-220",
            customer: "Recovered Co",
            owner: "support",
            summary: "Retry worked",
            status: "new",
          },
        ]);
      }),
    );

    render(<App />);
    await screen.findByRole("alert");

    await user.click(screen.getByRole("button", { name: "Retry" }));

    expect(screen.getByRole("status")).toHaveTextContent("Loading cases...");
    expect(await screen.findByText("Recovered Co")).toBeInTheDocument();
    expect(requests).toBe(2);
  });

  it("shows case details returned by GET /api/cases", async () => {
    server.use(
      http.get("/api/cases", () =>
        HttpResponse.json([
          {
            id: "CASE-104",
            customer: "Northstar Health",
            owner: "billing",
            summary: "Invoice export is blocked",
            status: "investigating",
          },
        ]),
      ),
    );

    render(<App />);

    expect(await screen.findByText("Northstar Health")).toBeInTheDocument();
    expect(screen.getByText("Invoice export is blocked")).toBeInTheDocument();
    expect(screen.getByText(/CASE-104/)).toBeInTheDocument();
  });

  it("shows the server-empty message for an empty response", async () => {
    server.use(http.get("/api/cases", () => HttpResponse.json([])));

    render(<App />);

    expect(await screen.findByText("No cases are assigned yet.")).toBeInTheDocument();
    expect(screen.queryByRole("list", { name: "Cases" })).not.toBeInTheDocument();
  });

  it("shows an alert and Retry action when the request fails", async () => {
    server.use(
      http.get("/api/cases", () =>
        HttpResponse.json({ message: "unavailable" }, { status: 503 }),
      ),
    );

    render(<App />);

    expect(await screen.findByRole("alert")).toHaveTextContent("We could not load cases");
    expect(screen.getByRole("button", { name: "Retry" })).toBeInTheDocument();
  });
});
