package com.digitalfactory.platform.repository;

import com.digitalfactory.platform.model.User;
import com.digitalfactory.platform.model.enums.UserRole;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
import java.util.UUID;

public interface UserRepository extends JpaRepository<User, UUID> {
    Optional<User> findByEmail(String email);
    long countByRoleNot(UserRole role);
}