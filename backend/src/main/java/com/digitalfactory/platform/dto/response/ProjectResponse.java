package com.digitalfactory.platform.dto.response;

import com.digitalfactory.platform.model.Project;
import com.digitalfactory.platform.model.enums.ProjectStatus;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Data
@Builder
public class ProjectResponse {
    private UUID id;
    private String title;
    private String description;
    private ProjectStatus status;
    private UserResponse supervisor;
    private Set<UserResponse> interns;
    private LocalDateTime createdAt;

    public static ProjectResponse fromEntity(Project project) {
        return ProjectResponse.builder()
                .id(project.getId())
                .title(project.getTitle())
                .description(project.getDescription())
                .status(project.getStatus())
                .supervisor(UserResponse.fromEntity(project.getSupervisor()))
                .interns(project.getInterns().stream()
                        .map(UserResponse::fromEntity)
                        .collect(Collectors.toSet()))
                .createdAt(project.getCreatedAt())
                .build();
    }
}