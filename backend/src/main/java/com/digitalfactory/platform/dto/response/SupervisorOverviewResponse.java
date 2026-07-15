package com.digitalfactory.platform.dto.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class SupervisorOverviewResponse {
    private FeaturedProjectDto featuredProject;
    private long actionRequiredTasks;
}