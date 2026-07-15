package com.digitalfactory.platform.controller;

import com.digitalfactory.platform.dto.request.CommentCreateRequest;
import com.digitalfactory.platform.dto.request.TaskCreateRequest;
import com.digitalfactory.platform.dto.request.TaskUpdateRequest;
import com.digitalfactory.platform.dto.response.MessageResponse;
import com.digitalfactory.platform.dto.response.PageResponse;
import com.digitalfactory.platform.dto.response.ProjectResponse;
import com.digitalfactory.platform.dto.response.SupervisorOverviewResponse;
import com.digitalfactory.platform.dto.response.TaskResponse;
import com.digitalfactory.platform.service.CommentService;
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
    private final CommentService commentService;

    @GetMapping("/projects")
    public ResponseEntity<PageResponse<ProjectResponse>> getMyProjects(
            Principal principal,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        // principal.getName() safely returns the email extracted from the JWT token
        return ResponseEntity.ok(new PageResponse<>(supervisorService.getMyProjects(principal.getName(), page, size)));
    }

    @PostMapping("/tasks")
    public ResponseEntity<?> createTask(
            Principal principal,
            @Valid @RequestBody TaskCreateRequest request
    ) {
        supervisorService.createTask(principal.getName(), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(new MessageResponse("Task created and assigned successfully"));
    }

    @GetMapping("/projects/{projectId}/tasks")
    public ResponseEntity<PageResponse<TaskResponse>> getProjectTasks(
            Principal principal,
            @PathVariable UUID projectId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        return ResponseEntity.ok(new PageResponse<>(supervisorService.getProjectTasks(principal.getName(), projectId, page, size)));
    }

    @PutMapping("/tasks/{taskId}")
    public ResponseEntity<?> updateTask(
            Principal principal,
            @PathVariable UUID taskId,
            @RequestBody TaskUpdateRequest request
    ) {
        return ResponseEntity.ok(supervisorService.updateTask(principal.getName(), taskId, request));
    }

    // @GetMapping("/tasks/{taskId}")
    // public ResponseEntity<TaskResponse> getTaskById(Principal principal, @PathVariable UUID taskId) {
    //     return ResponseEntity.ok(supervisorService.getTaskById(principal.getName(), taskId));
    // }

    @DeleteMapping("/tasks/{taskId}")
    public ResponseEntity<?> deleteTask(
            Principal principal,
            @PathVariable UUID taskId
    ) {
        supervisorService.deleteTask(principal.getName(), taskId);
        return ResponseEntity.ok(new MessageResponse("Task deleted successfully"));
    }

    @GetMapping("/tasks/{taskId}/comments")
    public ResponseEntity<?> getTaskComments(
            Principal principal,
            @PathVariable UUID taskId
    ) {
        return ResponseEntity.ok(commentService.getTaskComments(principal.getName(), taskId));
    }

    @PostMapping("/tasks/{taskId}/comments")
    public ResponseEntity<?> addComment(
            Principal principal,
            @PathVariable UUID taskId,
            @Valid @RequestBody CommentCreateRequest request
    ) {
        return ResponseEntity.status(HttpStatus.CREATED).body(commentService.addComment(principal.getName(), taskId, request));
    }

    @GetMapping("/dashboard/overview")
    public ResponseEntity<SupervisorOverviewResponse> getDashboardOverview(Principal principal) {
        return ResponseEntity.ok(supervisorService.getDashboardOverview(principal.getName()));
    }
}