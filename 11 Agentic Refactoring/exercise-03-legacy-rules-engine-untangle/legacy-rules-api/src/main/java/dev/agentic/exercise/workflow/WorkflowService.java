package dev.agentic.exercise.workflow;

import java.util.Collection;
import org.springframework.stereotype.Service;

@Service
public class WorkflowService {
  private final WorkflowRepository repository;
  private final DecisionPolicy decisionPolicy;

  public WorkflowService(WorkflowRepository repository, DecisionPolicy decisionPolicy) {
    this.repository = repository;
    this.decisionPolicy = decisionPolicy;
  }

  public Collection<WorkflowItem> list() {
    return repository.findAll();
  }

  public WorkflowItem decide(String id, WorkflowDecision decision) {
    WorkflowItem item = repository.findById(id)
        .orElseThrow(() -> new WorkflowNotFoundException(id));

    decisionPolicy.validate(decision);

    return repository.save(new WorkflowItem(
        item.id(),
        item.customer(),
        decision.status(),
        item.score(),
        decision.owner(),
        decision.evidenceNote()));
  }
}
