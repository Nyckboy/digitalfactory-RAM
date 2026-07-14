package com.digitalfactory.platform.service;

import com.digitalfactory.platform.dto.response.ActivityLogResponse;
import com.digitalfactory.platform.model.ActivityLog;
import com.digitalfactory.platform.model.User;
import com.digitalfactory.platform.repository.ActivityLogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ActivityLogService {

    private final ActivityLogRepository activityLogRepository;

    // We will call this method from other services whenever something important happens
    public void logActivity(User actor, String action, String target) {
        ActivityLog log = ActivityLog.builder()
                .actorName(actor.getFirstName() + " " + actor.getLastName())
                .action(action)
                .target(target)
                .build();
        
        activityLogRepository.save(log);
    }

    // Called by the AdminController to populate the feed
    public List<ActivityLogResponse> getRecentActivities(int limit) {
        return activityLogRepository.findRecentActivities(PageRequest.of(0, limit))
                .stream()
                .map(ActivityLogResponse::fromEntity)
                .collect(Collectors.toList());
    }
}