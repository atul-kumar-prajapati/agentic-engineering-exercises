import assert from "node:assert/strict";
import { buttonVariantFor } from "../src/migration/exportButton.mjs";
function givenExportAction_whenButtonVariantIsResolved_thenReturnsDsSecondary() {
  // Arrange
  const action = "export";
  // Act
  const variant = buttonVariantFor(action);
  // Assert
  assert.equal(variant, "ds-secondary");
}
function givenCheckoutAction_whenButtonVariantIsResolved_thenReturnsLegacyPrimary() {
  // Arrange
  const action = "checkout";
  // Act
  const variant = buttonVariantFor(action);
  // Assert
  assert.equal(variant, "legacy-primary");
}
function givenDeleteAction_whenButtonVariantIsResolved_thenReturnsLegacyDanger() {
  // Arrange
  const action = "delete";
  // Act
  const variant = buttonVariantFor(action);
  // Assert
  assert.equal(variant, "legacy-danger");
}
function givenUnknownAction_whenButtonVariantIsResolved_thenReturnsLegacyPrimary() {
  // Arrange
  const action = "unknown";
  // Act
  const variant = buttonVariantFor(action);
  // Assert
  assert.equal(variant, "legacy-primary");
}
givenExportAction_whenButtonVariantIsResolved_thenReturnsDsSecondary();
givenCheckoutAction_whenButtonVariantIsResolved_thenReturnsLegacyPrimary();
givenDeleteAction_whenButtonVariantIsResolved_thenReturnsLegacyDanger();
givenUnknownAction_whenButtonVariantIsResolved_thenReturnsLegacyPrimary();
