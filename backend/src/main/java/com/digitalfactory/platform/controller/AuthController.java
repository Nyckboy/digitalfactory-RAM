package com.digitalfactory.platform.controller;

import com.digitalfactory.platform.dto.request.LoginRequest;
import com.digitalfactory.platform.dto.response.AuthResponse;
import com.digitalfactory.platform.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        
        String token = authService.authenticate(
                request.getEmail(), 
                request.getPassword()
        );
        
        return ResponseEntity.ok(new AuthResponse(token));
    }
}