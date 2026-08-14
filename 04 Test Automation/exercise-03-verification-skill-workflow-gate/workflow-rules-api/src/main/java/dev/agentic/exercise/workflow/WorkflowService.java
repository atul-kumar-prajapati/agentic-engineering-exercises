package dev.agentic.exercise.workflow;

import java.util.Collection;
import org.springframework.stereotype.Service;

@Service
public class WorkflowService {
  private final WorkflowRepository repository;

  public WorkflowService(WorkflowRepository repository) {
    this.repository = repository;
  }

  public Collection<WorkflowItem> list() {
    return repository.findAll();
  }

  public WorkflowItem decide(String id, WorkflowDecision decision) {
    WorkflowItem item = repository.findById(id)
        .orElseThrow(() -> new WorkflowNotFoundException(id));

    if ("Ready".equals(decision.status()) && decision.evidenceNote().length() < 12) {
      throw new InvalidWorkflowDecisionException("Ready decisions require a longer evidence note");
    }

    return repository.save(new WorkflowItem(
        item.id(),
        item.customer(),
        decision.status(),
        item.score(),
        decision.owner(),
        decision.evidenceNote()));
  }
}
