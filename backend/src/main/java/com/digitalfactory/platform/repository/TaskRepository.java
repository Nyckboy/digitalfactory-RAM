package com.digitalfactory.platform.repository;

import com.digitalfactory.platform.model.Task;
import com.digitalfactory.platform.model.enums.TaskStatus;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
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
}