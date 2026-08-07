package com.digitalfactory.platform.controller;

import com.digitalfactory.platform.dto.response.NotificationResponse;
import com.digitalfactory.platform.model.User;
import com.digitalfactory.platform.repository.UserRepository;
import com.digitalfactory.platform.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;
    private final UserRepository userRepository;

    @GetMapping("/unread")
    public ResponseEntity<List<NotificationResponse>> getUnreadNotifications(Principal principal) {
        // Find the currently logged-in user
        User user = userRepository.findByEmail(principal.getName())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        
        return ResponseEntity.ok(notificationService.getUnreadNotifications(user.getId()));
    }

    @PutMapping("/{id}/read")
    public ResponseEntity<Void> markAsRead(@PathVariable UUID id) {
        notificationService.markAsRead(id);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/read-all")
    public ResponseEntity<Void> markAllAsRead(Principal principal) {
        // Find the currently logged-in user
        User user = userRepository.findByEmail(principal.getName())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        
        // Mark all of their notifications as read
        notificationService.markAllAsRead(user.getId());
        
        return ResponseEntity.ok().build();
    }
}