export interface LabContract {
  title: string;
  competency: string;
  domain: string;
  mission: string;
  outcome: string;
  entities: string[];
  seededDefects: string[];
  verificationGates: string[];
  agentWorkflow: string[];
  workingDeliverables: string[];
  masterySignals: string[];
}

export const labContract: LabContract = {
  "title": "Contract-Safe Full-Stack Rules Extraction",
  "competency": "11. Agentic Refactoring - Test-driven tech-debt cleanup",
  "domain": "Spring Boot rules endpoint refactor with preserved contract",
  "mission": "Refactor a Spring Boot rules endpoint and React UI adapter without changing the contract clients depend on.",
  "outcome": "A Spring Boot rules endpoint is refactored only after API behavior and logs are protected.",
  "entities": [
    "rules endpoint",
    "validation",
    "side effect",
    "golden API response"
  ],
  "seededDefects": [
    "validation and side effects are interleaved",
    "refactor changes error code contract",
    "audit log text changes without approval"
  ],
  "verificationGates": [
    "Spring characterization tests",
    "API golden comparison",
    "React adapter smoke",
    "contract preservation check"
  ],
  "agentWorkflow": [
    "Ask the coding agent to inspect this lab contract, starter code, docs, and tests before proposing a plan.",
    "Revise the agent plan so it exercises the competency practice and avoids the common mistake.",
    "Implement the smallest working change that addresses the seeded defects.",
    "Run the verification gates and capture command evidence before writing the final review note."
  ],
  "workingDeliverables": [
    "Spring Boot characterization/integration tests.",
    "Refactored backend rules code.",
    "React adapter updates only where needed.",
    "Golden-case comparison evidence."
  ],
  "masterySignals": [
    "Add characterization and integration tests around the legacy rules endpoint.",
    "Separate validation, rule evaluation, persistence, and side effects.",
    "Preserve API shape, logs, and frontend behavior unless explicitly categorized as bugs.",
    "Compare before/after responses using golden cases."
  ]
};
