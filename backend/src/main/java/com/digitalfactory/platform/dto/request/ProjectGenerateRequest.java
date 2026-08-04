package com.digitalfactory.platform.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.util.Set;
import java.util.UUID;

@Data
public class ProjectGenerateRequest {
    @NotBlank(message = "Prompt is required")
    private String prompt;
}