package com.digitalfactory.platform.controller;

import com.digitalfactory.platform.dto.request.CommentCreateRequest;
import com.digitalfactory.platform.dto.request.TaskStatusUpdateRequest;
import com.digitalfactory.platform.dto.response.InternDashboardResponse;
import com.digitalfactory.platform.dto.response.PageResponse;
import com.digitalfactory.platform.dto.response.TaskResponse;
import com.digitalfactory.platform.service.CommentService;
import com.digitalfactory.platform.service.InternService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.UUID;

@RestController
@RequestMapping("/api/intern")
@RequiredArgsConstructor
public class InternController {

    private final InternService internService;
    private final CommentService commentService;

    @GetMapping("/tasks")
    public ResponseEntity<PageResponse<TaskResponse>> getMyTasks(
            Principal principal,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        return ResponseEntity.ok(new PageResponse<>(internService.getMyTasks(principal.getName(), page, size)));
    }

    @PatchMapping("/tasks/{taskId}")
    public ResponseEntity<?> updateTaskStatus(
            Principal principal,
            @PathVariable UUID taskId,
            @Valid @RequestBody TaskStatusUpdateRequest request
    ) {
        return ResponseEntity.ok(internService.updateTaskStatus(principal.getName(), taskId, request));
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

    @GetMapping("/dashboard")
    public ResponseEntity<InternDashboardResponse> getDashboardOverview(Principal principal) {
        return ResponseEntity.ok(internService.getDashboardOverview(principal.getName()));
    }
}