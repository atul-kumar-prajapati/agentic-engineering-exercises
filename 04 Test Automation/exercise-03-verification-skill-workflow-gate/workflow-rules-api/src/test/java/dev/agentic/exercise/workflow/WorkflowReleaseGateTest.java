package dev.agentic.exercise.workflow;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.Collection;
import org.junit.jupiter.api.Test;

class WorkflowReleaseGateTest {
  private final ObjectMapper objectMapper = new ObjectMapper();

  @Test
  void everyExistingWorkflowIncludesItsDerivedDecisionState() {
    WorkflowService service = new WorkflowService(new WorkflowRepository());
    JsonNode payload = objectMapper.valueToTree(service.list());

    assertThat(payload.findValuesAsText("decisionState"))
        .containsExactly("needs-evidence", "pending-review", "accepted");
  }

  @Test
  void acceptedReadyDecisionIncludesAcceptedState() throws Exception {
    WorkflowService service = new WorkflowService(new WorkflowRepository());
    WorkflowItem result = service.decide("wf-101", new WorkflowDecision("Ready", "Asha", "Verified release evidence"));

    assertThat(objectMapper.writeValueAsString(result)).contains("\"decisionState\":\"accepted\"");
  }

  @Test
  void blockedDecisionIncludesNeedsEvidenceState() throws Exception {
    WorkflowService service = new WorkflowService(new WorkflowRepository());
    WorkflowItem result = service.decide("wf-103", new WorkflowDecision("Blocked", "Rina", "Waiting for signed approval"));

    assertThat(objectMapper.writeValueAsString(result)).contains("\"decisionState\":\"needs-evidence\"");
  }

  @Test
  void rejectsUnknownDecisionTransitionWithoutSavingIt() {
    WorkflowRepository repository = new WorkflowRepository();
    WorkflowService service = new WorkflowService(repository);

    assertThatThrownBy(() -> service.decide("wf-101", new WorkflowDecision("Archived", "Asha", "Unsupported state")))
        .isInstanceOf(InvalidWorkflowDecisionException.class);

    Collection<WorkflowItem> items = repository.findAll();
    assertThat(items).filteredOn(item -> item.id().equals("wf-101"))
        .singleElement()
        .extracting(WorkflowItem::status)
        .isEqualTo("Blocked");
  }
}
