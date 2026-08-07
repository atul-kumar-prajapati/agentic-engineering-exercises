import { Component } from "react";

export class LegacyActionWithState extends Component<object, { pending: boolean }> {
  state = { pending: false };
  render() { return <button disabled={this.state.pending}>Stateful action</button>; }
}
