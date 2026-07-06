package com.digitalfactory.platform.dto.response;

import com.digitalfactory.platform.model.User;
import com.digitalfactory.platform.model.enums.UserRole;
import lombok.Builder;
import lombok.Data;
import java.util.UUID;

@Data
@Builder
public class UserResponse {
    private UUID id;
    private String firstName;
    private String lastName;
    private String email;
    private UserRole role;
    private Boolean isActive;

    public static UserResponse fromEntity(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .email(user.getEmail())
                .role(user.getRole())
                .isActive(user.getIsActive())
                .build();
    }
}