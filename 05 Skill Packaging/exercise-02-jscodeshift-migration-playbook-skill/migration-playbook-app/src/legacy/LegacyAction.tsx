import { Component, type KeyboardEvent } from "react";

interface LegacyActionProps {
  label: string;
  onActivate: () => void;
}

export class LegacyAction extends Component<LegacyActionProps> {
  handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === "Enter" || event.key === " ") this.props.onActivate();
  };

  render() {
    return (
      <button className="legacy-action" onClick={this.props.onActivate} onKeyDown={this.handleKeyDown} type="button">
        {this.props.label}
      </button>
    );
  }
}
