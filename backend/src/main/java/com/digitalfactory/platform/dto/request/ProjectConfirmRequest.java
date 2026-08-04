package com.digitalfactory.platform.dto.request;

import com.digitalfactory.platform.dto.AiProjectDraft;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.util.Set;
import java.util.UUID;

@Data
public class ProjectConfirmRequest {
    @NotNull(message = "The finalized draft is required")
    private AiProjectDraft draft;
    
    @NotNull(message = "Supervisor is required")
    private UUID supervisorId;
    
    private Set<UUID> internIds;
}