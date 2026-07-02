package com.digitalfactory.platform.service;

import com.digitalfactory.platform.model.User;
import com.digitalfactory.platform.repository.UserRepository;
import com.digitalfactory.platform.security.JwtService;
import lombok.RequiredArgsConstructor;
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
        // This will verify the credentials against the DB via the AuthenticationProvider
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(email, password)
        );
        
        var user = repository.findByEmail(email)
                .orElseThrow(); // Should be caught by a global exception handler in production
                
        return jwtService.generateToken(user);
    }
}