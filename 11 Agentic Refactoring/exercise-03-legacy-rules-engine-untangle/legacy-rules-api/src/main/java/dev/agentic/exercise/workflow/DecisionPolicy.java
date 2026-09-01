package dev.agentic.exercise.workflow;

import org.springframework.stereotype.Component;

@Component
public class DecisionPolicy {
  public void validate(WorkflowItem item, WorkflowDecision decision) {
    boolean readyNoteTooShort =
        "Ready".equals(decision.status()) && decision.evidenceNote().length() < 12;
    if (readyNoteTooShort) {
      throw new InvalidWorkflowDecisionException("Ready decisions require a longer evidence note");
    }
  }
}
