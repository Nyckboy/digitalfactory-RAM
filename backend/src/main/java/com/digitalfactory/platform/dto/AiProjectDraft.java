package com.digitalfactory.platform.dto;

import lombok.Data;
import java.util.List;

@Data
public class AiProjectDraft {
    private String title;
    private String description;
    private List<AiTaskDraft> tasks;

    @Data
    public static class AiTaskDraft {
        private String title;
        private String description;
    }
}