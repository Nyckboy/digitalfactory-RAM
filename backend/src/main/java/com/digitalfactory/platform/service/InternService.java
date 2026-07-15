package com.digitalfactory.platform.service;

import com.digitalfactory.platform.dto.request.TaskStatusUpdateRequest;
import com.digitalfactory.platform.dto.response.InternDashboardResponse;
import com.digitalfactory.platform.dto.response.TaskResponse;
import com.digitalfactory.platform.model.Task;
import com.digitalfactory.platform.model.User;
import com.digitalfactory.platform.model.enums.TaskStatus;
import com.digitalfactory.platform.repository.TaskRepository;
import com.digitalfactory.platform.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class InternService {

    private final TaskRepository taskRepository;
    private final UserRepository userRepository;
    private final ActivityLogService activityLogService;

    @Transactional(readOnly = true)
    public Page<TaskResponse> getMyTasks(String internEmail, int page, int size) {
        User intern = userRepository.findByEmail(internEmail)
                .orElseThrow(() -> new IllegalArgumentException("Intern not found"));

        return taskRepository.findByAssignedToId(intern.getId(), PageRequest.of(page, size))
                .map(TaskResponse::fromEntity);
    }

    @Transactional
    public TaskResponse updateTaskStatus(String internEmail, UUID taskId, TaskStatusUpdateRequest request) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new IllegalArgumentException("Task not found"));

        // Security Check: Is this task actually assigned to this intern?
        if (!task.getAssignedTo().getEmail().equals(internEmail)) {
            throw new SecurityException("You do not have permission to update this task");
        }

        task.setStatus(request.getStatus());
        
        if (request.getSubmissionUrl() != null) {
            task.setSubmissionUrl(request.getSubmissionUrl());
        }

        activityLogService.logActivity(
            task.getAssignedTo(), 
            "updated task status to " + request.getStatus().name() + " on", 
            task.getTitle()
        );

        return TaskResponse.fromEntity(taskRepository.save(task));
    }

    @Transactional(readOnly = true)
    public InternDashboardResponse getDashboardOverview(String internEmail) {
        User intern = userRepository.findByEmail(internEmail)
                .orElseThrow(() -> new IllegalArgumentException("Intern not found"));

        UUID internId = intern.getId();
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime nextWeek = now.plusDays(7);

        // Calculate Stats
        long completed = taskRepository.countByAssignedToIdAndStatus(internId, TaskStatus.COMPLETED);
        long activeTasks = taskRepository.countByAssignedToIdAndStatusNot(internId, TaskStatus.COMPLETED);
        long upcoming = taskRepository.countByAssignedToIdAndStatusNotAndDeadlineBetween(
                internId, 
                TaskStatus.COMPLETED, 
                now, 
                nextWeek
        );

        // Fetch Top 4 Urgent Tasks for the widget
        List<TaskResponse> urgentTasks = taskRepository.findByAssignedToIdAndStatusNotOrderByDeadlineAsc(
                internId, 
                TaskStatus.COMPLETED, 
                PageRequest.of(0, 4)
        ).stream().map(TaskResponse::fromEntity).toList();

        return InternDashboardResponse.builder()
                .assignedTasks(activeTasks)
                .completedDeliverables(completed)
                .upcomingDeadlines(upcoming)
                .urgentTasks(urgentTasks)
                .build();
    }
}