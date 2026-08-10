package dev.agentic.exercise.workflow;

import jakarta.validation.constraints.NotBlank;

public record WorkflowDecision(
    @NotBlank String status,
    @NotBlank String owner,
    @NotBlank String evidenceNote) {
}
