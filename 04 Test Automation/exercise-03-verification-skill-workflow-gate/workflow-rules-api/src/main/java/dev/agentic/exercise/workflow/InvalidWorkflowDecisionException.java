package dev.agentic.exercise.workflow;

public class InvalidWorkflowDecisionException extends RuntimeException {
  public InvalidWorkflowDecisionException(String message) {
    super(message);
  }
}
