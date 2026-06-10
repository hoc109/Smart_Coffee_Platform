package com.qlcafe.backend.controller;
import org.springframework.web.bind.annotation.RestController;
@RestController
public class GlobalExceptionHandler {
    @org.springframework.web.bind.annotation.ExceptionHandler(Exception.class)
    public org.springframework.http.ResponseEntity<?> handleException(Exception e) {
        return org.springframework.http.ResponseEntity.badRequest().body(new com.qlcafe.backend.dto.MessageResponse(e.getMessage()));
    }
}
