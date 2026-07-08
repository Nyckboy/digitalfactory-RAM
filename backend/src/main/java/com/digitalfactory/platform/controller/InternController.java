package com.digitalfactory.platform.controller;

import com.digitalfactory.platform.dto.request.TaskStatusUpdateRequest;
import com.digitalfactory.platform.dto.response.MessageResponse;
import com.digitalfactory.platform.dto.response.PageResponse;
import com.digitalfactory.platform.dto.response.TaskResponse;
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

    @GetMapping("/tasks")
    public ResponseEntity<PageResponse<TaskResponse>> getMyTasks(
            Principal principal,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        var tasks = internService.getMyTasks(principal.getName(), page, size);
        return ResponseEntity.ok(new PageResponse<>(tasks));
    }

    @PatchMapping("/tasks/{taskId}")
    public ResponseEntity<?> updateTaskStatus(
            Principal principal,
            @PathVariable UUID taskId,
            @Valid @RequestBody TaskStatusUpdateRequest request
    ) {
        try {
            TaskResponse updatedTask = internService.updateTaskStatus(principal.getName(), taskId, request);
            return ResponseEntity.ok(updatedTask);
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(new MessageResponse(e.getMessage()));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new MessageResponse(e.getMessage()));
        }
    }
}