package com.digitalfactory.platform.service;

import com.digitalfactory.platform.dto.request.CommentCreateRequest;
import com.digitalfactory.platform.dto.response.CommentResponse;
import com.digitalfactory.platform.model.Comment;
import com.digitalfactory.platform.model.Task;
import com.digitalfactory.platform.model.User;
import com.digitalfactory.platform.repository.CommentRepository;
import com.digitalfactory.platform.repository.TaskRepository;
import com.digitalfactory.platform.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CommentService {

    private final CommentRepository commentRepository;
    private final TaskRepository taskRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public List<CommentResponse> getTaskComments(String userEmail, UUID taskId) {
        Task task = getTaskAndVerifyAccess(userEmail, taskId);

        return commentRepository.findByTaskIdOrderByCreatedAtAsc(task.getId())
                .stream()
                .map(CommentResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional
    public CommentResponse addComment(String userEmail, UUID taskId, CommentCreateRequest request) {
        User author = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
                
        Task task = getTaskAndVerifyAccess(userEmail, taskId);

        Comment comment = Comment.builder()
                .content(request.getContent())
                .task(task)
                .author(author)
                .build();

        return CommentResponse.fromEntity(commentRepository.save(comment));
    }

    // Helper method to enforce security for both Supervisors and Interns
    private Task getTaskAndVerifyAccess(String userEmail, UUID taskId) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new IllegalArgumentException("Task not found"));

        boolean isProjectSupervisor = task.getProject().getSupervisor().getEmail().equals(userEmail);
        boolean isAssignedIntern = task.getAssignedTo().getEmail().equals(userEmail);

        if (!isProjectSupervisor && !isAssignedIntern) {
            throw new SecurityException("You do not have permission to access comments for this task");
        }

        return task;
    }
}