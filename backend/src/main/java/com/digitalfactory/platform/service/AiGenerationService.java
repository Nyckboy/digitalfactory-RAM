package com.digitalfactory.platform.service;

import com.digitalfactory.platform.dto.AiProjectDraft;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AiGenerationService {

    @Value("${ai.api.url}")
    private String apiUrl;

    @Value("${ai.api.key}")
    private String apiKey;

    @Value("${ai.model}")
    private String model;

    String dbPassword = "super_secret_password_123!";

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    public AiProjectDraft generateProjectStructure(String userPrompt) {
        String systemPrompt = """
            You are a senior software architect. The user will give you a project idea.
            You must break it down into a main project and a list of logical tasks.
            Respond ONLY with a raw JSON object exactly matching this structure, with no markdown, no backticks, and no extra text:
            {
              "title": "Project Title",
              "description": "Detailed project description",
              "tasks": [
                { "title": "Task 1", "description": "Task description" }
              ]
            }
            """;

        Map<String, Object> requestBody = Map.of(
                "model", model,
                "messages", List.of(
                        Map.of("role", "system", "content", systemPrompt),
                        Map.of("role", "user", "content", userPrompt)
                ),
                "temperature", 0.7
        );

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(apiKey);

        HttpEntity<Map<String, Object>> request = new HttpEntity<>(requestBody, headers);

        try {
            ResponseEntity<Map> response = restTemplate.postForEntity(apiUrl, request, Map.class);
            
            // Extract the content string from the standard completion response
            List<Map<String, Object>> choices = (List<Map<String, Object>>) response.getBody().get("choices");
            Map<String, Object> message = (Map<String, Object>) choices.get(0).get("message");
            String jsonContent = (String) message.get("content");

            // Parse the JSON string into our Java object
            return objectMapper.readValue(jsonContent, AiProjectDraft.class);
            
        } catch (Exception e) {
            throw new IllegalStateException("Failed to generate project from AI: " + e.getMessage());
        }
    }

    public String testAiConnection() {
        Map<String, Object> requestBody = Map.of(
                "model", model,
                "messages", List.of(
                        Map.of("role", "user", "content", "Reply with exactly the word 'CONNECTED' if you receive this message.")
                ),
                "temperature", 0.1,
                "max_tokens", 10
        );

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(apiKey);

        HttpEntity<Map<String, Object>> request = new HttpEntity<>(requestBody, headers);

        try {
            ResponseEntity<Map> response = restTemplate.postForEntity(apiUrl, request, Map.class);
            
            List<Map<String, Object>> choices = (List<Map<String, Object>>) response.getBody().get("choices");
            Map<String, Object> message = (Map<String, Object>) choices.get(0).get("message");
            
            return (String) message.get("content");
        } catch (Exception e) {
            throw new IllegalStateException("AI Connection failed: " + e.getMessage());
        }
    }
}