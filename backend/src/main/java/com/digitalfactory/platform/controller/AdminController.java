package com.digitalfactory.platform.controller;

import com.digitalfactory.platform.dto.request.ProjectCreateRequest;
import com.digitalfactory.platform.dto.request.ProjectUpdateRequest;
import com.digitalfactory.platform.dto.request.RegisterRequest;
import com.digitalfactory.platform.dto.request.UserUpdateRequest;
import com.digitalfactory.platform.dto.response.MessageResponse;
import com.digitalfactory.platform.dto.response.PageResponse;
import com.digitalfactory.platform.dto.response.ProjectResponse;
import com.digitalfactory.platform.dto.response.UserResponse;
import com.digitalfactory.platform.service.ProjectService;
import com.digitalfactory.platform.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final UserService userService;
    private final ProjectService projectService;

    @PostMapping("/users/register")
    public ResponseEntity<?> registerUser(@Valid @RequestBody RegisterRequest request) {
        try {
            userService.registerUser(request);
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(new MessageResponse("User registered successfully"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new MessageResponse(e.getMessage()));
        }
    }

    @GetMapping("/users")
    public ResponseEntity<PageResponse<UserResponse>> getAllUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        var userPage = userService.getAllUsers(page, size);
        return ResponseEntity.ok(new PageResponse<>(userPage));
    }

    @PutMapping("/users/{userId}")
    public ResponseEntity<?> updateUser(
            @PathVariable UUID userId,
            @RequestBody UserUpdateRequest request
    ) {
        try {
            return ResponseEntity.ok(userService.updateUser(userId, request));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(new MessageResponse(e.getMessage()));
        }
    }

    @DeleteMapping("/users/{userId}")
    public ResponseEntity<?> deleteUser(@PathVariable UUID userId) {
        try {
            userService.deleteUser(userId);
            return ResponseEntity.ok(new MessageResponse("User deleted successfully"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(new MessageResponse(e.getMessage()));
        } catch (IllegalStateException e) {
            // Returns 409 Conflict if we had to deactivate instead of hard delete
            return ResponseEntity.status(HttpStatus.CONFLICT).body(new MessageResponse(e.getMessage()));
        }
    }

    @PostMapping("/projects")
    public ResponseEntity<?> createProject(@Valid @RequestBody ProjectCreateRequest request) {
        try {
            projectService.createProject(request);
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(new MessageResponse("Project created and assigned successfully"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new MessageResponse(e.getMessage()));
        }
    }

    @GetMapping("/projects")
    public ResponseEntity<PageResponse<ProjectResponse>> getAllProjects(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        var projectPage = projectService.getAllProjects(page, size);
        return ResponseEntity.ok(new PageResponse<>(projectPage));
    }

    @PutMapping("/projects/{projectId}")
    public ResponseEntity<?> updateProject(
            @PathVariable UUID projectId,
            @RequestBody ProjectUpdateRequest request
    ) {
        try {
            return ResponseEntity.ok(projectService.updateProject(projectId, request));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(new MessageResponse(e.getMessage()));
        }
    }

    @DeleteMapping("/projects/{projectId}")
    public ResponseEntity<?> deleteProject(@PathVariable UUID projectId) {
        try {
            projectService.deleteProject(projectId);
            return ResponseEntity.ok(new MessageResponse("Project deleted successfully"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(new MessageResponse(e.getMessage()));
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(new MessageResponse(e.getMessage()));
        }
    }
}