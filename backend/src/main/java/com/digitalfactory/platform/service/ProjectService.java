package com.digitalfactory.platform.service;

import com.digitalfactory.platform.dto.request.ProjectCreateRequest;
import com.digitalfactory.platform.dto.response.ProjectResponse;
import com.digitalfactory.platform.model.Project;
import com.digitalfactory.platform.model.User;
import com.digitalfactory.platform.model.enums.UserRole;
import com.digitalfactory.platform.repository.ProjectRepository;
import com.digitalfactory.platform.repository.UserRepository;
import lombok.RequiredArgsConstructor;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ProjectService {

    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;

    @Transactional
    public Project createProject(ProjectCreateRequest request) {
        
        // 1. Validate and fetch the Supervisor
        User supervisor = userRepository.findById(request.getSupervisorId())
                .orElseThrow(() -> new IllegalArgumentException("Supervisor not found"));
                
        if (supervisor.getRole() != UserRole.SUPERVISOR) {
            throw new IllegalArgumentException("The assigned user is not a Supervisor");
        }

        // 2. Validate and fetch the Interns
        Set<User> validInterns = new HashSet<>();
        if (request.getInternIds() != null && !request.getInternIds().isEmpty()) {
            List<User> foundInterns = userRepository.findAllById(request.getInternIds());
            
            for (User intern : foundInterns) {
                if (intern.getRole() != UserRole.INTERN) {
                    throw new IllegalArgumentException("User " + intern.getEmail() + " is not an Intern");
                }
                validInterns.add(intern);
            }
        }

        // 3. Build and save the Project
        Project project = Project.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .supervisor(supervisor)
                .interns(validInterns)
                .build();

        return projectRepository.save(project);
    }

    @Transactional(readOnly = true) // readOnly optimizes database fetching
    public Page<ProjectResponse> getAllProjects(int page, int size) {
        return projectRepository.findAll(PageRequest.of(page, size))
                .map(ProjectResponse::fromEntity);
    }
}