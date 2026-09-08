package com.qlcafe.backend.controller;
import com.qlcafe.backend.dto.AuthRequest;
import com.qlcafe.backend.dto.GoogleAuthRequest;
import com.qlcafe.backend.service.AuthService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private final AuthService authService;
    public AuthController(AuthService authService) {
        this.authService = authService;
    }
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody AuthRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody AuthRequest request) {
        authService.register(request);
        return ResponseEntity.ok().body("{\"message\": \"Registered successfully\"}");
    }

    @PostMapping("/google")
    public ResponseEntity<?> loginWithGoogle(@RequestBody GoogleAuthRequest request) {
        return ResponseEntity.ok(authService.loginWithGoogle(request));
    }
}
