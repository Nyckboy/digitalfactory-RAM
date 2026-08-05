package com.digitalfactory.platform.service;

import com.digitalfactory.platform.model.Notification;
import com.digitalfactory.platform.model.User;
import com.digitalfactory.platform.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;
    // This is Spring's built-in tool for sending WebSocket messages
    private final SimpMessagingTemplate messagingTemplate; 

    @Transactional
    public void createAndSendNotification(User recipient, String message) {
        // 1. Save to PostgreSQL
        Notification notification = Notification.builder()
                .recipient(recipient)
                .message(message)
                .isRead(false)
                .build();
        
        Notification savedNotification = notificationRepository.save(notification);

        // 2. Push to WebSocket (Real-Time Delivery)
        // We route it specifically to /queue/notifications/{userId}
        String destination = "/queue/notifications/" + recipient.getId().toString();
        
        // We send a simple JSON-like string, but you can create a NotificationResponse DTO here
        messagingTemplate.convertAndSend(destination, savedNotification.getMessage());
        
        System.out.println("[WEBSOCKET] Pushed notification to: " + destination);
    }
}