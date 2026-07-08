package com.digitalfactory.platform.dto.request;

import com.digitalfactory.platform.model.enums.TaskStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class TaskStatusUpdateRequest {
    
    @NotNull(message = "Task status is required")
    private TaskStatus status;
    
    private String submissionUrl;
}