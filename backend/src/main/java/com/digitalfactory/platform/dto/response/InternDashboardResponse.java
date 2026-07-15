package com.digitalfactory.platform.dto.response;

import lombok.Builder;
import lombok.Data;
import java.util.List;

@Data
@Builder
public class InternDashboardResponse {
    // Top Cards
    private long assignedTasks;
    private long completedDeliverables;
    private long upcomingDeadlines;
    
    // Bottom Widget
    private List<TaskResponse> urgentTasks;
}