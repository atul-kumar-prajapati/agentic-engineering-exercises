package dev.agentic.exercise.workflow;

public class WorkflowNotFoundException extends RuntimeException {
  public WorkflowNotFoundException(String id) {
    super("Workflow item not found: " + id);
  }
}
