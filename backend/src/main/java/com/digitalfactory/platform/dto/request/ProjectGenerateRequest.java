package com.digitalfactory.platform.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ProjectGenerateRequest {
    @NotBlank(message = "Prompt is required")
    private String prompt;
}