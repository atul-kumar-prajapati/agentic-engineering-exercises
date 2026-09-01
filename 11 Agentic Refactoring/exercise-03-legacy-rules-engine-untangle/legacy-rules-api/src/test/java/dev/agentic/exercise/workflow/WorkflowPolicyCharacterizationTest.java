package dev.agentic.exercise.workflow;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import org.junit.jupiter.api.Test;

class WorkflowPolicyCharacterizationTest {
  static final class RecordingRepository extends WorkflowRepository {
    int saves;

    @Override
    public WorkflowItem save(WorkflowItem item) {
      saves += 1;
      return super.save(item);
    }
  }

  @Test
  void givenMissingIdAndInvalidReadyNote_whenDecideIsCalled_thenThrowsWorkflowNotFoundExceptionAndSavesNothing() {
    // Arrange
    RecordingRepository repository = new RecordingRepository();
    WorkflowService service = new WorkflowService(repository);
    WorkflowDecision invalidReady = new WorkflowDecision("Ready", "Asha", "short");

    // Act / Assert
    assertThatThrownBy(() -> service.decide("missing", invalidReady))
        .isInstanceOf(WorkflowNotFoundException.class)
        .hasMessage("Workflow item not found: missing");
    assertThat(repository.saves).isZero();
  }

  @Test
  void givenReadyNoteLengthEleven_whenDecideIsCalled_thenThrowsExactInvalidDecisionMessageZeroSavesAndItemUnchanged() {
    // Arrange
    RecordingRepository repository = new RecordingRepository();
    WorkflowService service = new WorkflowService(repository);
    WorkflowItem before = repository.findById("wf-101").orElseThrow();
    WorkflowDecision shortReady = new WorkflowDecision("Ready", "Asha", "12345678901");

    // Act / Assert
    assertThatThrownBy(() -> service.decide("wf-101", shortReady))
        .isInstanceOf(InvalidWorkflowDecisionException.class)
        .hasMessage("Ready decisions require a longer evidence note");
    assertThat(repository.findById("wf-101").orElseThrow()).isEqualTo(before);
    assertThat(repository.saves).isZero();
  }

  @Test
  void givenReadyNoteLengthTwelve_whenDecideIsCalled_thenAcceptsDecisionAndSavesOnce() {
    // Arrange
    RecordingRepository repository = new RecordingRepository();
    WorkflowService service = new WorkflowService(repository);
    WorkflowDecision boundaryReady = new WorkflowDecision("Ready", "Asha", "123456789012");

    // Act
    WorkflowItem item = service.decide("wf-101", boundaryReady);

    // Assert
    assertThat(item).isEqualTo(new WorkflowItem("wf-101", "Atlas Co", "Ready", 91, "Asha", "123456789012"));
    assertThat(repository.saves).isEqualTo(1);
  }

  @Test
  void givenUnknownNonReadyStatus_whenDecideIsCalled_thenAcceptsEscalatedLaterAndSavesOnce() {
    // Arrange
    RecordingRepository repository = new RecordingRepository();
    WorkflowService service = new WorkflowService(repository);
    WorkflowDecision unknownStatus = new WorkflowDecision(
        "Escalated Later", "Rina", "Legacy accepts this status");

    // Act
    WorkflowItem item = service.decide("wf-102", unknownStatus);

    // Assert
    assertThat(item).isEqualTo(new WorkflowItem(
        "wf-102", "Brightline", "Escalated Later", 74, "Rina", "Legacy accepts this status"));
    assertThat(repository.saves).isEqualTo(1);
  }

  @Test
  void givenValidBlockedDecision_whenDecideIsCalled_thenPreservesIdCustomerScoreReplacesStatusOwnerNoteAndSavesOnce() {
    // Arrange
    RecordingRepository repository = new RecordingRepository();
    WorkflowService service = new WorkflowService(repository);
    WorkflowItem before = repository.findById("wf-102").orElseThrow();
    WorkflowDecision blocked = new WorkflowDecision("Blocked", "Rina", "Waiting for signed approval");

    // Act
    WorkflowItem item = service.decide("wf-102", blocked);

    // Assert
    assertThat(item.id()).isEqualTo(before.id());
    assertThat(item.customer()).isEqualTo(before.customer());
    assertThat(item.score()).isEqualTo(before.score());
    assertThat(item.status()).isEqualTo("Blocked");
    assertThat(item.owner()).isEqualTo("Rina");
    assertThat(item.note()).isEqualTo("Waiting for signed approval");
    assertThat(repository.saves).isEqualTo(1);
  }
}
