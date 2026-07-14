package com.digitalfactory.platform.dto.response;

import com.digitalfactory.platform.model.ActivityLog;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
public class ActivityLogResponse {
    private UUID id;
    private String actorName;
    private String action;
    private String target;
    private LocalDateTime timestamp;

    public static ActivityLogResponse fromEntity(ActivityLog log) {
        return ActivityLogResponse.builder()
                .id(log.getId())
                .actorName(log.getActorName())
                .action(log.getAction())
                .target(log.getTarget())
                .timestamp(log.getTimestamp())
                .build();
    }
}