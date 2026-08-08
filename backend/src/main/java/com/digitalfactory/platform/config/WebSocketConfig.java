package com.digitalfactory.platform.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        // The endpoint the React frontend will connect to.
        // setAllowedOriginPatterns("*") is used for development to avoid CORS blocks.
        registry.addEndpoint("/ws").setAllowedOriginPatterns("*").withSockJS();
    }

    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        // "/topic" is for broadcasting to many users, "/queue" is for private 1-to-1 messages
        config.enableSimpleBroker("/topic", "/queue");
        // The prefix for messages sent FROM the client to the server (if needed later)
        config.setApplicationDestinationPrefixes("/app");
    }
}