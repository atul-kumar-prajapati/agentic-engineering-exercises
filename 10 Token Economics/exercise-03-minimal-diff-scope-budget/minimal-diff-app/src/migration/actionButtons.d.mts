export type ActionButton = { action: string; label: string; variant: string };
export function exportButton(): ActionButton;
export function checkoutButton(): ActionButton;
export function deleteButton(): ActionButton;
export function legacyActionButton(action: string, label: string): ActionButton;
