package com.digitalfactory.platform.dto.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class AdminDashboardStatsResponse {
    private long activeProjects;
    private long teamMembers;
    private long tasksCompleted;
}