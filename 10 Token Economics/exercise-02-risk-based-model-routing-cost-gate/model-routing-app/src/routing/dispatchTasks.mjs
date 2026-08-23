import { routeTask } from "./routeTask.mjs";

/** Application consumer used by protected tests; learners change routeTask, not this boundary. */
export async function dispatchTasks(tasks, { execute, clarify }) {
  return Promise.all(tasks.map(async (task) => {
    const route = routeTask(task);
    if (route === "clarify") return { id: task.id, route, result: await clarify(task) };
    return { id: task.id, route, result: await execute(route, task) };
  }));
}
