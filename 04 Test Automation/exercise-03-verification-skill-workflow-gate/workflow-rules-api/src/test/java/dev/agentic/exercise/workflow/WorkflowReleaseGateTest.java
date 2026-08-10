package dev.agentic.exercise.workflow;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;

class WorkflowReleaseGateTest {
  private final ObjectMapper objectMapper = new ObjectMapper();

  @Test
  void everyWorkflowResponseIncludesDecisionState() throws Exception {
    WorkflowService service = new WorkflowService(new WorkflowRepository());
    String json = objectMapper.writeValueAsString(service.list().iterator().next());

    assertThat(json).contains("\"decisionState\":");
  }

  @Test
  void acceptedReadyDecisionIncludesAcceptedState() throws Exception {
    WorkflowService service = new WorkflowService(new WorkflowRepository());
    WorkflowItem result = service.decide("wf-101", new WorkflowDecision("Ready", "Asha", "Verified release evidence"));

    assertThat(objectMapper.writeValueAsString(result)).contains("\"decisionState\":\"accepted\"");
  }

  @Test
  void rejectsUnknownDecisionTransition() {
    WorkflowService service = new WorkflowService(new WorkflowRepository());

    assertThatThrownBy(() -> service.decide("wf-101", new WorkflowDecision("Archived", "Asha", "Unsupported state")))
        .isInstanceOf(InvalidWorkflowDecisionException.class);
  }
}
