export interface LabContract {
  title: string; competency: string; domain: string; mission: string; outcome: string;
  entities: string[]; seededDefects: string[]; verificationGates: string[];
  agentWorkflow: string[]; workingDeliverables: string[]; masterySignals: string[];
}

export const labContract: LabContract = {
  title: "Repeated Mistake to Repository Rule",
  competency: "12. Agentic Retrospective - Session review, waste reduction, and improvement",
  domain: "Trace-backed repository guidance with behavioral patch comparison",
  mission: "Convert three recurring persistence mistakes into minimal routed guidance that improves a fresh first attempt.",
  outcome: "Matched agent patches and focused Git history prove that concise guidance prevents repeated defects.",
  entities: ["correction event", "safe-start rule", "deep persistence guidance", "first-attempt patch"],
  seededDefects: ["proving task omits hidden persistence conventions", "starter stores display and noncanonical values", "business logic uses ambient time"],
  verificationGates: ["two-event support per rule", "minimal and nonduplicated guidance", "isolated patch grading", "matched fresh-agent conditions"],
  agentWorkflow: ["Capture the unguided first patch.", "Commit only routed repository guidance.", "Capture a fresh guided first patch under matched conditions.", "Apply the successful patch and verify behavior and history."],
  workingDeliverables: ["AGENTS and focused persistence guidance.", "Before and after raw patches and metadata.", "Final source and participant test.", "Rule map, comparison, and Git proof."],
  masterySignals: ["Promotes only repeated corrections.", "Keeps deep detail out of safe-start context.", "Tests both rule effectiveness and exceptions.", "Binds final implementation to the graded agent patch."],
};
