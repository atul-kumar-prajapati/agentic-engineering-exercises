export type RoutingTask = {
  id: string;
  risk?: string;
  ambiguity?: string;
  scope?: string;
};

export function dispatchTasks(
  tasks: RoutingTask[],
  handlers: {
    execute: (tier: string, task: RoutingTask) => Promise<unknown>;
    clarify: (task: RoutingTask) => Promise<unknown>;
  },
): Promise<Array<{ id: string; route: string; result: unknown }>>;
