package com.digitalfactory.platform.service;

import com.digitalfactory.platform.dto.request.RegisterRequest;
import com.digitalfactory.platform.dto.request.UserUpdateRequest;
import com.digitalfactory.platform.dto.response.UserResponse;
import com.digitalfactory.platform.model.User;
import com.digitalfactory.platform.repository.UserRepository;
import lombok.RequiredArgsConstructor;

import java.util.UUID;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public User registerUser(RegisterRequest request) {
        // 1. Check if the email is already taken
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new IllegalArgumentException("Email is already in use");
        }

        // 2. Build the new user entity
        User newUser = User.builder()
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .email(request.getEmail())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .role(request.getRole())
                .isActive(true)
                .build();

        // 3. Save to the database
        return userRepository.save(newUser);
    }

    public Page<UserResponse> getAllUsers(int page, int size) {
        return userRepository.findAll(PageRequest.of(page, size))
                .map(UserResponse::fromEntity); // Safely converts User to UserResponse
    }

    @Transactional
    public UserResponse updateUser(UUID userId, UserUpdateRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        if (request.getEmail() != null && !request.getEmail().equals(user.getEmail())) {
            if (userRepository.findByEmail(request.getEmail()).isPresent()) {
                throw new IllegalArgumentException("Email is already in use");
            }
            user.setEmail(request.getEmail());
        }

        if (request.getFirstName() != null) user.setFirstName(request.getFirstName());
        if (request.getLastName() != null) user.setLastName(request.getLastName());
        if (request.getRole() != null) user.setRole(request.getRole());
        if (request.getIsActive() != null) user.setIsActive(request.getIsActive());

        return UserResponse.fromEntity(userRepository.save(user));
    }

    @Transactional
    public void deleteUser(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        
        try {
            userRepository.delete(user);
        } catch (DataIntegrityViolationException e) {
            // If the user has assigned projects or tasks, a hard delete will fail.
            // In this case, we forcefully deactivate them instead to maintain history.
            user.setIsActive(false);
            userRepository.save(user);
            throw new IllegalStateException("User has active records. Account was deactivated instead of deleted.");
        }
    }
}