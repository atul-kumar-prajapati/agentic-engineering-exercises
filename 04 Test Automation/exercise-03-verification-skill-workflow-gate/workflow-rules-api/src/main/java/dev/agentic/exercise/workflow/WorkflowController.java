package dev.agentic.exercise.workflow;

import jakarta.validation.Valid;
import java.util.Collection;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/workflows")
public class WorkflowController {
  private final WorkflowService service;

  public WorkflowController(WorkflowService service) {
    this.service = service;
  }

  @GetMapping
  public Collection<WorkflowItem> list() {
    return service.list();
  }

  @PostMapping("/{id}/decisions")
  @ResponseStatus(HttpStatus.ACCEPTED)
  public WorkflowItem decide(@PathVariable String id, @Valid @RequestBody WorkflowDecision decision) {
    return service.decide(id, decision);
  }
}
