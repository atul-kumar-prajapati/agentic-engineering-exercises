import { delay, http, HttpResponse } from "msw";

export const handlers = [
  http.get("/api/cases", async () => {
    await delay(80);
    return HttpResponse.json([
      { id: "CASE-104", customer: "Northstar Health", owner: "billing", summary: "Invoice export is blocked", status: "investigating" },
      { id: "CASE-108", customer: "Aster Labs", owner: "identity", summary: "Approver group is missing", status: "new" },
    ]);
  }),
];
