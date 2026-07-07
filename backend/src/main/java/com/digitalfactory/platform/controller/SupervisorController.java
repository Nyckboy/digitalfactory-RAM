package com.digitalfactory.platform.controller;

import com.digitalfactory.platform.dto.request.TaskCreateRequest;
import com.digitalfactory.platform.dto.request.TaskUpdateRequest;
import com.digitalfactory.platform.dto.response.MessageResponse;
import com.digitalfactory.platform.dto.response.PageResponse;
import com.digitalfactory.platform.dto.response.ProjectResponse;
import com.digitalfactory.platform.dto.response.TaskResponse;
import com.digitalfactory.platform.service.SupervisorService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.UUID;

@RestController
@RequestMapping("/api/supervisor")
@RequiredArgsConstructor
public class SupervisorController {

    private final SupervisorService supervisorService;

    @GetMapping("/projects")
    public ResponseEntity<PageResponse<ProjectResponse>> getMyProjects(
            Principal principal,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        // principal.getName() safely returns the email extracted from the JWT token
        var projects = supervisorService.getMyProjects(principal.getName(), page, size);
        return ResponseEntity.ok(new PageResponse<>(projects));
    }

    @PostMapping("/tasks")
    public ResponseEntity<?> createTask(
            Principal principal,
            @Valid @RequestBody TaskCreateRequest request
    ) {
        try {
            supervisorService.createTask(principal.getName(), request);
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(new MessageResponse("Task created and assigned successfully"));
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(new MessageResponse(e.getMessage()));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new MessageResponse(e.getMessage()));
        }
    }

    @GetMapping("/projects/{projectId}/tasks")
    public ResponseEntity<PageResponse<TaskResponse>> getProjectTasks(
            Principal principal,
            @PathVariable UUID projectId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        try {
            var tasks = supervisorService.getProjectTasks(principal.getName(), projectId, page, size);
            return ResponseEntity.ok(new PageResponse<>(tasks));
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
    }

    @PutMapping("/tasks/{taskId}")
    public ResponseEntity<?> updateTask(
            Principal principal,
            @PathVariable UUID taskId,
            @RequestBody TaskUpdateRequest request
    ) {
        try {
            TaskResponse updatedTask = supervisorService.updateTask(principal.getName(), taskId, request);
            return ResponseEntity.ok(updatedTask);
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(new MessageResponse(e.getMessage()));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new MessageResponse(e.getMessage()));
        }
    }

    @DeleteMapping("/tasks/{taskId}")
    public ResponseEntity<?> deleteTask(
            Principal principal,
            @PathVariable UUID taskId
    ) {
        try {
            supervisorService.deleteTask(principal.getName(), taskId);
            return ResponseEntity.ok(new MessageResponse("Task deleted successfully"));
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(new MessageResponse(e.getMessage()));
        }
    }
}