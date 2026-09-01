package dev.agentic.exercise.workflow;

import org.springframework.stereotype.Component;

@Component
public class DecisionPolicy {
  public void validate(WorkflowDecision decision) {
    if ("Ready".equals(decision.status()) && decision.evidenceNote().length() < 12) {
      throw new InvalidWorkflowDecisionException("Ready decisions require a longer evidence note");
    }
  }
}
