package com.rupiksha.backend.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.client.HttpStatusCodeException;
import org.springframework.web.HttpRequestMethodNotSupportedException;
import org.springframework.http.converter.HttpMessageNotReadableException;

import java.io.PrintWriter;
import java.io.StringWriter;
import java.util.Map;

@ControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(HttpRequestMethodNotSupportedException.class)
    public ResponseEntity<?> methodNotAllowed(HttpRequestMethodNotSupportedException ex) {
        return ResponseEntity.status(HttpStatus.METHOD_NOT_ALLOWED).body(Map.of(
                "success", false,
                "error", "Method Not Allowed",
                "message", ex.getMessage()
        ));
    }

    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<?> badRequest(HttpMessageNotReadableException ex) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of(
                "success", false,
                "error", "Bad Request - JSON parse error",
                "message", ex.getMessage()
        ));
    }

    @ExceptionHandler(HttpStatusCodeException.class)
    public ResponseEntity<?> handleHttpStatusCodeException(HttpStatusCodeException ex) {
        String body = ex.getResponseBodyAsString();
        return ResponseEntity.status(ex.getStatusCode()).body(Map.of(
                "success", false,
                "error", "Upstream HTTP Error",
                "status", ex.getStatusCode().value(),
                "message", ex.getMessage(),
                "raw_error", body == null ? "" : body
        ));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<?> handleAll(Exception ex) {
        StringWriter sw = new StringWriter();
        ex.printStackTrace(new PrintWriter(sw));
        String stack = sw.toString();
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                "success", false,
                "error", "Internal Server Error",
                "message", ex.getMessage(),
                "stack", stack
        ));
    }
}
