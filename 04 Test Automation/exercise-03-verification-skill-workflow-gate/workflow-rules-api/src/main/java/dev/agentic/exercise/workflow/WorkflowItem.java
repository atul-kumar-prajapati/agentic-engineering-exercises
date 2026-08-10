package dev.agentic.exercise.workflow;

public record WorkflowItem(
    String id,
    String customer,
    String status,
    int score,
    String owner,
    String note) {
}
