package com.digitalfactory.platform.repository;

import com.digitalfactory.platform.model.Project;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.UUID;

public interface ProjectRepository extends JpaRepository<Project, UUID> {
}