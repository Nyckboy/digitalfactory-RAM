package com.digitalfactory.platform.service;

import com.digitalfactory.platform.repository.UserRepository;
import com.digitalfactory.platform.security.JwtService;
import lombok.RequiredArgsConstructor;

import java.util.HashMap;
import java.util.Map;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository repository;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    public String authenticate(String email, String password) {
        // Verify credentials
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(email, password)
        );
        
        // Fetch the user
        var user = repository.findByEmail(email)
                .orElseThrow(); 
                
        // Inject custom claims (The Role)
        Map<String, Object> extraClaims = new HashMap<>();
        extraClaims.put("role", user.getRole().name());
        
        // Generate token WITH the extra claims
        return jwtService.generateToken(extraClaims, user);
    }
}