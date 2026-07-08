package com.digitalfactory.platform.dto.request;

import com.digitalfactory.platform.model.enums.UserRole;
import lombok.Data;

@Data
public class UserUpdateRequest {
    private String firstName;
    private String lastName;
    private String email;
    private UserRole role;
    private Boolean isActive; // Used to deactivate a user instead of deleting them
}