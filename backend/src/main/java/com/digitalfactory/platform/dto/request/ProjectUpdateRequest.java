package com.digitalfactory.platform.dto.request;

import com.digitalfactory.platform.model.enums.ProjectStatus;
import lombok.Data;

import java.util.Set;
import java.util.UUID;

@Data
public class ProjectUpdateRequest {
    private String title;
    private String description;
    private ProjectStatus status;
    private UUID supervisorId;
    private Set<UUID> internIds;
}