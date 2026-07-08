package com.digitalfactory.platform.dto.response;

import com.digitalfactory.platform.model.Comment;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
public class CommentResponse {
    private UUID id;
    private String content;
    private LocalDateTime createdAt;
    private String authorName; // First + Last name
    private String authorRole; // SUPERVISOR or INTERN

    public static CommentResponse fromEntity(Comment comment) {
        return CommentResponse.builder()
                .id(comment.getId())
                .content(comment.getContent())
                .createdAt(comment.getCreatedAt())
                .authorName(comment.getAuthor().getFirstName() + " " + comment.getAuthor().getLastName())
                .authorRole(comment.getAuthor().getRole().name())
                .build();
    }
}