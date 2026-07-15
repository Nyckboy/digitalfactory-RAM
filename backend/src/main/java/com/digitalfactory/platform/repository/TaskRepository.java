package com.digitalfactory.platform.repository;

import com.digitalfactory.platform.model.Task;
import com.digitalfactory.platform.model.enums.TaskStatus;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public interface TaskRepository extends JpaRepository<Task, UUID> {
    Page<Task> findByProjectId(UUID projectId, Pageable pageable);
    Page<Task> findByAssignedToId(UUID internId, Pageable pageable);
    long countByStatus(TaskStatus status);
    // Counts how many tasks are in a specific status (e.g., COMPLETED) for a single project
    long countByProjectIdAndStatus(UUID projectId, TaskStatus status);
    // Counts total tasks for a project
    long countByProjectId(UUID projectId);
    // Counts how many tasks across ALL the supervisor's projects need review
    long countByProjectSupervisorIdAndStatus(UUID supervisorId, TaskStatus status);
    @Query("SELECT t FROM Task t WHERE t.project.supervisor.id = :supervisorId AND t.status IN :statuses ORDER BY t.deadline ASC")
    List<Task> findOngoingTasksForSupervisor(
            @Param("supervisorId") UUID supervisorId,
            @Param("statuses") List<TaskStatus> statuses,
            Pageable pageable
    );

    // 1. Count tasks by assigned user and status (for COMPLETED)
    long countByAssignedToIdAndStatus(UUID internId, TaskStatus status);

    // 2. Count active tasks (everything EXCEPT completed)
    long countByAssignedToIdAndStatusNot(UUID internId, TaskStatus status);

    // 3. Count tasks due between now and X days from now
    long countByAssignedToIdAndStatusNotAndDeadlineBetween(
            UUID internId, 
            TaskStatus status, 
            LocalDateTime startDate, 
            LocalDateTime endDate
    );

    // 4. Fetch the urgent tasks for the widget
    List<Task> findByAssignedToIdAndStatusNotOrderByDeadlineAsc(
            UUID internId, 
            TaskStatus status, 
            Pageable pageable
    );
}