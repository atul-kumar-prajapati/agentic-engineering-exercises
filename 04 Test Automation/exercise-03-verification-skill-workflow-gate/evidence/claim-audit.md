# Previous Release Claim Audit

- Date: 2026-08-14
- Source: `docs/release-claim.md`
- Named check: `WorkflowServiceTest`
- Fresh reconstructed command from `workflow-rules-api`: `.\mvnw.cmd -Dtest=WorkflowServiceTest test`
- Exit code: 0
- Relevant output: `Tests run: 2, Failures: 0, Errors: 0, Skipped: 0` and `BUILD SUCCESS`
- Relevant artifact: `workflow-rules-api/src/test/java/dev/agentic/exercise/workflow/WorkflowServiceTest.java`

The tracked previous claim does not preserve an exact shell invocation, timestamp, output, or exit code. The command above is the faithful Windows reconstruction of the one named test class and was run fresh for this audit.

That result proves only that the service rejects a Ready decision with a short evidence note and updates the owner and status for a Blocked decision. It does not prove the client rejects an incomplete response, the provider returns the client-required `decisionState`, the HTTP boundary rejects an unknown transition, the complete provider suite passes, either full build passes, or the release is ready.
