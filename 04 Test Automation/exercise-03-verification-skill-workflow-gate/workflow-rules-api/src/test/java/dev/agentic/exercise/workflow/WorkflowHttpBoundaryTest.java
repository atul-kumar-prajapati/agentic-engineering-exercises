package dev.agentic.exercise.workflow;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest
@AutoConfigureMockMvc
class WorkflowHttpBoundaryTest {
  @Autowired
  private MockMvc mockMvc;

  @Autowired
  private WorkflowRepository repository;

  @BeforeEach
  void resetWorkflows() {
    repository.reset();
  }

  @Test
  void listResponseIncludesClientRequiredDecisionState() throws Exception {
    mockMvc.perform(get("/api/workflows"))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$[0].decisionState").value("needs-evidence"));
  }

  @Test
  void acceptedReadyDecisionReturnsAcceptedState() throws Exception {
    mockMvc.perform(post("/api/workflows/wf-101/decisions")
            .contentType(MediaType.APPLICATION_JSON)
            .content("""
                {
                  "status": "Ready",
                  "owner": "Asha",
                  "evidenceNote": "Verified release evidence"
                }
                """))
        .andExpect(status().isAccepted())
        .andExpect(jsonPath("$.decisionState").value("accepted"));
  }

  @Test
  void unknownTransitionIsRejectedAtHttpBoundary() throws Exception {
    mockMvc.perform(post("/api/workflows/wf-101/decisions")
            .contentType(MediaType.APPLICATION_JSON)
            .content("""
                {
                  "status": "Archived",
                  "owner": "Asha",
                  "evidenceNote": "Unsupported release transition"
                }
                """))
        .andExpect(status().isBadRequest());
  }
}
