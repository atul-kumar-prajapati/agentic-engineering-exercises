import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { AccessReviewQueue } from "../src/components/AccessReviewQueue";
import { accessReviews } from "../src/data/accessReviews";

describe("accessibility specialist gate", () => {
  it("uses keyboard-native controls and exposes the selected review", () => {
    const markup = renderToStaticMarkup(
      <AccessReviewQueue reviews={accessReviews} selectedId={accessReviews[0].id} onSelect={() => undefined} />,
    );
    expect(markup.match(/<button/g)).toHaveLength(accessReviews.length);
    expect(markup).toContain('aria-pressed="true"');
    expect(markup).not.toMatch(/<div[^>]+onClick/i);
  });
});
