import type { KeyboardEvent } from "react";

interface LegacyActionProps {
  label: string;
  onActivate: () => void;
}

export function LegacyAction({ label, onActivate }: LegacyActionProps) {
  function handleKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    if (event.key === "Enter" || event.key === " ") onActivate();
  }

  return <button className="legacy-action" onClick={onActivate} onKeyDown={handleKeyDown} type="button">{label}</button>;
}
