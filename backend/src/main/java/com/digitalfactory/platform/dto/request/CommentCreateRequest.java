package com.digitalfactory.platform.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CommentCreateRequest {
    @NotBlank(message = "Comment content cannot be empty")
    private String content;
}