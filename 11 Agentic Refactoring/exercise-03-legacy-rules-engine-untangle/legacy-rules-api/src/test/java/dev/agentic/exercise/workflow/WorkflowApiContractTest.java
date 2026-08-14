package dev.agentic.exercise.workflow;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.json.JsonCompareMode;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest
@AutoConfigureMockMvc
class WorkflowApiContractTest {
  @Autowired MockMvc mvc;

  @Test
  void acceptedDecisionKeepsStrictSixFieldJsonAnd202() throws Exception {
    mvc.perform(post("/api/workflows/wf-102/decisions")
        .contentType("application/json")
        .content("""
            {"status":"Blocked","owner":"Rina","evidenceNote":"Waiting for signed approval"}
            """))
        .andExpect(status().isAccepted())
        .andExpect(content().json("""
            {"id":"wf-102","customer":"Brightline","status":"Blocked","score":74,"owner":"Rina","note":"Waiting for signed approval"}
            """, JsonCompareMode.STRICT));
  }

  @Test
  void invalidDecisionKeepsExact400ErrorObject() throws Exception {
    mvc.perform(post("/api/workflows/wf-101/decisions")
        .contentType("application/json")
        .content("""
            {"status":"Ready","owner":"Asha","evidenceNote":"short"}
            """))
        .andExpect(status().isBadRequest())
        .andExpect(content().json("""
            {"error":"Ready decisions require a longer evidence note"}
            """, JsonCompareMode.STRICT));
  }

  @Test
  void missingWorkflowKeepsExact404ErrorObject() throws Exception {
    mvc.perform(post("/api/workflows/missing/decisions")
        .contentType("application/json")
        .content("""
            {"status":"Ready","owner":"Asha","evidenceNote":"short"}
            """))
        .andExpect(status().isNotFound())
        .andExpect(content().json("""
            {"error":"Workflow item not found: missing"}
            """, JsonCompareMode.STRICT));
  }
}
