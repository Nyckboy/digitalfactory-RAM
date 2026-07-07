package com.digitalfactory.platform.dto.response;

import com.digitalfactory.platform.model.Task;
import com.digitalfactory.platform.model.enums.TaskStatus;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
public class TaskResponse {
    private UUID id;
    private String title;
    private String description;
    private TaskStatus status;
    private LocalDateTime deadline;
    private UUID projectId;
    private UserResponse assignedTo;

    public static TaskResponse fromEntity(Task task) {
        return TaskResponse.builder()
                .id(task.getId())
                .title(task.getTitle())
                .description(task.getDescription())
                .status(task.getStatus())
                .deadline(task.getDeadline())
                .projectId(task.getProject().getId())
                .assignedTo(UserResponse.fromEntity(task.getAssignedTo()))
                .build();
    }
}