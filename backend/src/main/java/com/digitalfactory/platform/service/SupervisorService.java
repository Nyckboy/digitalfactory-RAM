package com.digitalfactory.platform.service;

import com.digitalfactory.platform.dto.request.TaskCreateRequest;
import com.digitalfactory.platform.dto.response.ProjectResponse;
import com.digitalfactory.platform.model.Project;
import com.digitalfactory.platform.model.Task;
import com.digitalfactory.platform.model.User;
import com.digitalfactory.platform.repository.ProjectRepository;
import com.digitalfactory.platform.repository.TaskRepository;
import com.digitalfactory.platform.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;


@Service
@RequiredArgsConstructor
public class SupervisorService {

    private final ProjectRepository projectRepository;
    private final TaskRepository taskRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public Page<ProjectResponse> getMyProjects(String supervisorEmail, int page, int size) {
        User supervisor = userRepository.findByEmail(supervisorEmail)
                .orElseThrow(() -> new IllegalArgumentException("Supervisor not found"));

        return projectRepository.findBySupervisorId(supervisor.getId(), PageRequest.of(page, size))
                .map(ProjectResponse::fromEntity);
    }

    @Transactional
    public Task createTask(String supervisorEmail, TaskCreateRequest request) {
        User supervisor = userRepository.findByEmail(supervisorEmail)
                .orElseThrow(() -> new IllegalArgumentException("Supervisor not found"));

        Project project = projectRepository.findById(request.getProjectId())
                .orElseThrow(() -> new IllegalArgumentException("Project not found"));

        // Security Check: Does this project belong to this supervisor?
        if (!project.getSupervisor().getId().equals(supervisor.getId())) {
            throw new SecurityException("You do not have permission to manage this project");
        }

        User intern = userRepository.findById(request.getAssignedToId())
                .orElseThrow(() -> new IllegalArgumentException("Intern not found"));

        // Security Check: Is this intern actually assigned to this project?
        if (!project.getInterns().contains(intern)) {
            throw new IllegalArgumentException("This intern is not assigned to the specified project");
        }

        Task task = Task.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .deadline(request.getDeadline())
                .project(project)
                .assignedTo(intern)
                .build();

        return taskRepository.save(task);
    }
}