import { performance } from "node:perf_hooks";

const reviews = Array.from({ length: 2_000 }, (_, index) => ({ risk: index % 80, privileged: index % 4 === 0 }));
const started = performance.now();
for (let pass = 0; pass < 500; pass += 1) {
  reviews.reduce((sum, review) => sum + review.risk + (review.privileged ? 20 : 0), 0);
}
const durationMs = Number((performance.now() - started).toFixed(2));
console.log(JSON.stringify({ scenario: "portfolio-risk-500-renders", sampleSize: reviews.length, durationMs }, null, 2));
