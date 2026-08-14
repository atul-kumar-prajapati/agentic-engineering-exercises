package dev.agentic.exercise.workflow;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import org.junit.jupiter.api.Test;

class WorkflowServiceTest {
  @Test
  void rejectsReadyDecisionWithoutEnoughEvidence() {
    WorkflowRepository repository = new WorkflowRepository();
    WorkflowService service = new WorkflowService(repository);

    assertThatThrownBy(() -> service.decide("wf-101", new WorkflowDecision("Ready", "Asha", "short")))
        .isInstanceOf(InvalidWorkflowDecisionException.class);
  }

  @Test
  void updatesWorkflowOwnerAndStatus() {
    WorkflowRepository repository = new WorkflowRepository();
    WorkflowService service = new WorkflowService(repository);

    WorkflowItem item = service.decide("wf-102", new WorkflowDecision("Blocked", "Rina", "Waiting for signed approval"));

    assertThat(item.status()).isEqualTo("Blocked");
    assertThat(item.owner()).isEqualTo("Rina");
  }
}
