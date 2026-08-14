package dev.agentic.exercise.workflow;

import java.util.Collection;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.Optional;
import org.springframework.stereotype.Repository;

@Repository
public class WorkflowRepository {
  private final Map<String, WorkflowItem> items = new LinkedHashMap<>();

  public WorkflowRepository() {
    reset();
  }

  public void reset() {
    items.clear();
    items.put("wf-101", new WorkflowItem(
        "wf-101", "Atlas Co", "Blocked", 91, "Asha", "Evidence missing", "needs-evidence"));
    items.put("wf-102", new WorkflowItem(
        "wf-102", "Brightline", "In Review", 74, "Mateo", "Waiting on approval", "pending"));
    items.put("wf-103", new WorkflowItem(
        "wf-103", "Cedar Labs", "Ready", 48, "Rina", "Ready for release", "accepted"));
  }

  public Collection<WorkflowItem> findAll() {
    return items.values();
  }

  public Optional<WorkflowItem> findById(String id) {
    return Optional.ofNullable(items.get(id));
  }

  public WorkflowItem save(WorkflowItem item) {
    items.put(item.id(), item);
    return item;
  }
}
