package dev.agentic.exercise.workflow;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.lang.reflect.Field;
import java.util.Arrays;
import org.junit.jupiter.api.Test;

class WorkflowContractCharacterizationTest {
  static final class RecordingRepository extends WorkflowRepository {
    int saves;

    @Override
    public WorkflowItem save(WorkflowItem item) {
      saves += 1;
      return super.save(item);
    }
  }

  @Test
  void rejectionPreservesExactMessageStateAndSaveCount() {
    RecordingRepository repository = new RecordingRepository();
    WorkflowService service = new WorkflowService(repository);
    WorkflowItem before = repository.findById("wf-101").orElseThrow();

    assertThatThrownBy(() -> service.decide("wf-101", new WorkflowDecision("Ready", "Asha", "12345678901")))
        .isInstanceOf(InvalidWorkflowDecisionException.class)
        .hasMessage("Ready decisions require a longer evidence note");

    assertThat(repository.findById("wf-101").orElseThrow()).isEqualTo(before);
    assertThat(repository.saves).isZero();
  }

  @Test
  void twelveCharacterBoundaryIsAcceptedAndSavedOnce() {
    RecordingRepository repository = new RecordingRepository();
    WorkflowItem item = new WorkflowService(repository)
        .decide("wf-101", new WorkflowDecision("Ready", "Asha", "123456789012"));

    assertThat(item).isEqualTo(new WorkflowItem("wf-101", "Atlas Co", "Ready", 91, "Asha", "123456789012"));
    assertThat(repository.saves).isEqualTo(1);
  }

  @Test
  void notFoundLookupPrecedesInvalidReadyPolicy() {
    RecordingRepository repository = new RecordingRepository();
    assertThatThrownBy(() -> new WorkflowService(repository)
        .decide("missing", new WorkflowDecision("Ready", "Asha", "short")))
        .isInstanceOf(WorkflowNotFoundException.class)
        .hasMessage("Workflow item not found: missing");
    assertThat(repository.saves).isZero();
  }

  @Test
  void unknownNonReadyStatusRemainsAccepted() {
    RecordingRepository repository = new RecordingRepository();
    WorkflowItem item = new WorkflowService(repository)
        .decide("wf-102", new WorkflowDecision("Escalated Later", "Rina", "Legacy accepts this status"));
    assertThat(item).isEqualTo(new WorkflowItem("wf-102", "Brightline", "Escalated Later", 74, "Rina", "Legacy accepts this status"));
    assertThat(repository.saves).isEqualTo(1);
  }

  @Test
  void decisionPolicyExistsIsRepositoryFreeAndIsInjectedIntoService() throws Exception {
    Class<?> policyType = Class.forName("dev.agentic.exercise.workflow.DecisionPolicy");
    assertThat(Arrays.stream(policyType.getDeclaredMethods()).map(method -> method.getName())).contains("validate");
    assertThat(Arrays.stream(policyType.getDeclaredFields()).map(Field::getType)).noneMatch(WorkflowRepository.class::isAssignableFrom);
    assertThat(Arrays.stream(WorkflowService.class.getDeclaredFields()).map(Field::getType)).contains(policyType);
    assertThat(Arrays.stream(WorkflowService.class.getDeclaredConstructors()))
        .anyMatch(constructor -> Arrays.equals(constructor.getParameterTypes(), new Class<?>[] { WorkflowRepository.class, policyType }));
  }
}
