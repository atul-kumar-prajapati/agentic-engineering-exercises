package dev.agentic.exercise.workflow;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import org.junit.jupiter.api.Test;

class WorkflowContractCharacterizationTest {
  @Test
  void rejectionPreservesMessageAndRepositoryState() {
    WorkflowRepository repository = new WorkflowRepository();
    WorkflowService service = new WorkflowService(repository);
    WorkflowItem before = repository.findById("wf-101").orElseThrow();

    assertThatThrownBy(() -> service.decide("wf-101", new WorkflowDecision("Ready", "Asha", "short")))
        .isInstanceOf(InvalidWorkflowDecisionException.class)
        .hasMessage("Ready decisions require a longer evidence note");

    assertThat(repository.findById("wf-101").orElseThrow()).isEqualTo(before);
  }

  @Test
  void acceptedDecisionPreservesPublicFields() {
    WorkflowService service = new WorkflowService(new WorkflowRepository());
    WorkflowItem item = service.decide("wf-102", new WorkflowDecision("Blocked", "Rina", "Waiting for signed approval"));
    assertThat(item.id()).isEqualTo("wf-102");
    assertThat(item.status()).isEqualTo("Blocked");
    assertThat(item.owner()).isEqualTo("Rina");
    assertThat(item.note()).isEqualTo("Waiting for signed approval");
  }
}
