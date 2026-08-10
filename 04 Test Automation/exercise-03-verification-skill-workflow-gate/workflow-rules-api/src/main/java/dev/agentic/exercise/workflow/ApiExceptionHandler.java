package dev.agentic.exercise.workflow;

import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class ApiExceptionHandler {
  @ExceptionHandler(WorkflowNotFoundException.class)
  @ResponseStatus(HttpStatus.NOT_FOUND)
  Map<String, String> notFound(WorkflowNotFoundException exception) {
    return Map.of("error", exception.getMessage());
  }

  @ExceptionHandler({ InvalidWorkflowDecisionException.class, MethodArgumentNotValidException.class })
  @ResponseStatus(HttpStatus.BAD_REQUEST)
  Map<String, String> badRequest(Exception exception) {
    return Map.of("error", exception.getMessage());
  }
}
