package com.digitalfactory.platform.repository;

import com.digitalfactory.platform.model.Project;
import com.digitalfactory.platform.model.enums.ProjectStatus;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface ProjectRepository extends JpaRepository<Project, UUID> {
    Page<Project> findBySupervisorId(UUID supervisorId, Pageable pageable);
    long countByStatus(ProjectStatus status);
    // Finds the most recently updated active project for a specific supervisor
    Optional<Project> findFirstBySupervisorIdAndStatusOrderByUpdatedAtDesc(
            UUID supervisorId, 
            ProjectStatus status
    );
}