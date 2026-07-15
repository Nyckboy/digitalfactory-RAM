package com.digitalfactory.platform.dto.response;

import lombok.Builder;
import lombok.Data;
import java.util.List;
import java.util.UUID;

@Data
@Builder
public class TeamDirectoryProjectDto {
    private UUID id;
    private String title;
    private int internCount;
    private List<UserResponse> interns;
}