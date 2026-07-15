package com.digitalfactory.platform.dto.response;

import lombok.Builder;
import lombok.Data;
import java.util.List;
import java.util.UUID;

@Data
@Builder
public class FeaturedProjectDto {
    private UUID id;
    private String title;
    private String description;
    private int progressPercentage;
    private List<UserResponse> teamMembers; 
}