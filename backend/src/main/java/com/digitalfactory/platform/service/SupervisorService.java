package com.digitalfactory.platform.service;

import com.digitalfactory.platform.dto.request.TaskCreateRequest;
import com.digitalfactory.platform.dto.request.TaskUpdateRequest;
import com.digitalfactory.platform.dto.response.ProjectResponse;
import com.digitalfactory.platform.dto.response.TaskResponse;
import com.digitalfactory.platform.model.Project;
import com.digitalfactory.platform.model.Task;
import com.digitalfactory.platform.model.User;
import com.digitalfactory.platform.repository.ProjectRepository;
import com.digitalfactory.platform.repository.TaskRepository;
import com.digitalfactory.platform.repository.UserRepository;
import lombok.RequiredArgsConstructor;

import java.util.UUID;

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
    private final ActivityLogService activityLogService;

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

        activityLogService.logActivity(
            supervisor,
            "assigned a new task to " + intern.getFirstName() + ":",
            task.getTitle()
        );

        return taskRepository.save(task);
    }

    @Transactional(readOnly = true)
    public Page<TaskResponse> getProjectTasks(String supervisorEmail, UUID projectId, int page, int size) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new IllegalArgumentException("Project not found"));

        // Security Check
        if (!project.getSupervisor().getEmail().equals(supervisorEmail)) {
            throw new SecurityException("You do not have permission to view tasks for this project");
        }

        return taskRepository.findByProjectId(projectId, PageRequest.of(page, size))
                .map(TaskResponse::fromEntity);
    }

    @Transactional
    public TaskResponse updateTask(String supervisorEmail, UUID taskId, TaskUpdateRequest request) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new IllegalArgumentException("Task not found"));

        // Security Check
        if (!task.getProject().getSupervisor().getEmail().equals(supervisorEmail)) {
            throw new SecurityException("You do not have permission to update this task");
        }

        // Update fields if they are provided in the request
        if (request.getTitle() != null) task.setTitle(request.getTitle());
        if (request.getDescription() != null) task.setDescription(request.getDescription());
        if (request.getStatus() != null) task.setStatus(request.getStatus());
        if (request.getDeadline() != null) task.setDeadline(request.getDeadline());

        // Handle reassignment safely
        if (request.getAssignedToId() != null) {
            User newIntern = userRepository.findById(request.getAssignedToId())
                    .orElseThrow(() -> new IllegalArgumentException("Intern not found"));
            
            if (!task.getProject().getInterns().contains(newIntern)) {
                throw new IllegalArgumentException("This intern is not assigned to the project");
            }
            task.setAssignedTo(newIntern);
        }

        activityLogService.logActivity(
            task.getProject().getSupervisor(),
            "updated the details of task",
            task.getTitle()
        );

        return TaskResponse.fromEntity(taskRepository.save(task));
    }

    @Transactional
    public void deleteTask(String supervisorEmail, UUID taskId) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new IllegalArgumentException("Task not found"));

        // Security Check
        if (!task.getProject().getSupervisor().getEmail().equals(supervisorEmail)) {
            throw new SecurityException("You do not have permission to delete this task");
        }

        taskRepository.delete(task);
    }
}