package com.digitalfactory.platform.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.util.Set;
import java.util.UUID;

@Data
public class ProjectCreateRequest {

    @NotBlank(message = "Project title is required")
    private String title;

    private String description;

    @NotNull(message = "Supervisor ID is required")
    private UUID supervisorId;

    // List of intern IDs to assign right away
    private Set<UUID> internIds; 
}