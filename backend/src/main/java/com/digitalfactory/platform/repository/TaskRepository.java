package com.digitalfactory.platform.repository;

import com.digitalfactory.platform.model.Task;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.UUID;

public interface TaskRepository extends JpaRepository<Task, UUID> {
    Page<Task> findByProjectId(UUID projectId, Pageable pageable);
}