package com.digitalfactory.platform.controller;

import com.digitalfactory.platform.dto.request.ProjectCreateRequest;
import com.digitalfactory.platform.dto.request.ProjectUpdateRequest;
import com.digitalfactory.platform.dto.request.RegisterRequest;
import com.digitalfactory.platform.dto.request.UserUpdateRequest;
import com.digitalfactory.platform.dto.response.ActivityLogResponse;
import com.digitalfactory.platform.dto.response.AdminDashboardStatsResponse;
import com.digitalfactory.platform.dto.response.MessageResponse;
import com.digitalfactory.platform.dto.response.PageResponse;
import com.digitalfactory.platform.dto.response.ProjectResponse;
import com.digitalfactory.platform.dto.response.UserResponse;
import com.digitalfactory.platform.service.ActivityLogService;
import com.digitalfactory.platform.service.ProjectService;
import com.digitalfactory.platform.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import java.util.List;
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
    private final ActivityLogService activityLogService;

    @PostMapping("/users/register")
    public ResponseEntity<?> registerUser(@Valid @RequestBody RegisterRequest request) {
        userService.registerUser(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(new MessageResponse("User registered successfully"));
    }

    @GetMapping("/users")
    public ResponseEntity<PageResponse<UserResponse>> getAllUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(new PageResponse<>(userService.getAllUsers(page, size)));
    }

    @PutMapping("/users/{userId}")
    public ResponseEntity<?> updateUser(@PathVariable UUID userId, @RequestBody UserUpdateRequest request) {
        return ResponseEntity.ok(userService.updateUser(userId, request));
    }

    @DeleteMapping("/users/{userId}")
    public ResponseEntity<?> deleteUser(@PathVariable UUID userId) {
        userService.deleteUser(userId);
        return ResponseEntity.ok(new MessageResponse("User deleted successfully"));
    }

    @PostMapping("/projects")
    public ResponseEntity<?> createProject(@Valid @RequestBody ProjectCreateRequest request) {
        projectService.createProject(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(new MessageResponse("Project created and assigned successfully"));
    }

    @GetMapping("/projects")
    public ResponseEntity<PageResponse<ProjectResponse>> getAllProjects(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(new PageResponse<>(projectService.getAllProjects(page, size)));
    }

    @PutMapping("/projects/{projectId}")
    public ResponseEntity<?> updateProject(
            @PathVariable UUID projectId,
            @RequestBody ProjectUpdateRequest request
    ) {
        return ResponseEntity.ok(projectService.updateProject(projectId, request));
    }

    @DeleteMapping("/projects/{projectId}")
    public ResponseEntity<?> deleteProject(@PathVariable UUID projectId) {
        projectService.deleteProject(projectId);
        return ResponseEntity.ok(new MessageResponse("Project deleted successfully"));
    }

    @GetMapping("/stats")
    public ResponseEntity<AdminDashboardStatsResponse> getDashboardStats() {
        return ResponseEntity.ok(projectService.getDashboardStats());
    }

    @GetMapping("/activities")
    public ResponseEntity<List<ActivityLogResponse>> getRecentActivities(
            @RequestParam(defaultValue = "5") int limit) {
        return ResponseEntity.ok(activityLogService.getRecentActivities(limit));
    }
}