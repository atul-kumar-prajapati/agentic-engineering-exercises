import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import App from "./App";

describe("case dashboard starter coverage", () => {
  it("shows a returned case", async () => {
    render(<App />);
    expect(await screen.findByText("Northstar Health")).toBeInTheDocument();
  });
});
