package com.digitalfactory.platform.repository;

import com.digitalfactory.platform.model.Comment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface CommentRepository extends JpaRepository<Comment, UUID> {
    // We return a List instead of Page because task comment threads are usually short enough to load all at once.
    List<Comment> findByTaskIdOrderByCreatedAtAsc(UUID taskId);
}