package com.digitalfactory.platform.dto.request;

import com.digitalfactory.platform.model.enums.TaskStatus;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
public class TaskUpdateRequest {
    private String title;
    private String description;
    private TaskStatus status;
    private LocalDateTime deadline;
    private UUID assignedToId; // In case they want to re-assign it to another intern
}