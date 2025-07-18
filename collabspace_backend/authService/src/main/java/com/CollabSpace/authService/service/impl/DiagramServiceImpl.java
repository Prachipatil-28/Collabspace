package com.CollabSpace.authService.service.impl;


import com.CollabSpace.authService.dtos.DiagramRequest;
import com.CollabSpace.authService.dtos.DiagramResponseDto;
import com.CollabSpace.authService.service.DiagramService;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;

import java.util.Map;

@Service
public class DiagramServiceImpl implements DiagramService {

    private final WebClient webClient;

    @Value("${gemini.api.url}")
    private String geminiApiUrl;
    @Value("${gemini.api.key}")
    private String geminiApiKey;

    public DiagramServiceImpl(WebClient.Builder webClientBuilder) {
        this.webClient = webClientBuilder.build();
    }

    @Override
    public DiagramResponseDto generateDiagram(DiagramRequest diagramRequest) {
        String rawPrompt = diagramRequest.getPrompt();
        String structuredPrompt = String.format(
                "Generate a detailed explanation of '%s' and provide a Mermaid diagram code (e.g., flowchart, sequence diagram) compatible with Mermaid.js. " +
                        "Ensure the Mermaid code is complete, valid, and properly formatted with no truncation. " +
                        "Format the response with an explanation section followed by a code section marked with ```mermaid\n<your complete mermaid code here>\n```.",
                rawPrompt
        );
        return callGeminiAPI(structuredPrompt);
    }

    private DiagramResponseDto callGeminiAPI(String prompt) {
        System.out.println("Calling Gemini API at: " + geminiApiUrl + geminiApiKey);
        System.out.println("Generated Prompt: " + prompt);

        Map<String, Object> requestBody = Map.of(
                "contents", new Object[] {
                        Map.of("parts", new Object[] {
                                Map.of("text", prompt)
                        })
                }
        );

        try {
            String response = webClient.post()
                    .uri(geminiApiUrl + geminiApiKey)
                    .header("Content-Type", "application/json")
                    .bodyValue(requestBody)
                    .retrieve()
                    .bodyToMono(String.class)
                    .block();

            String aiResponse = extractResponseContent(response);

            return DiagramResponseDto.builder()
                    .content(aiResponse)
                    .build();
        } catch (WebClientResponseException e) {
            System.err.println("API returned error: " + e.getStatusCode() + " - " + e.getResponseBodyAsString());
            return DiagramResponseDto.builder()
                    .content("We couldn’t generate your diagram right now. Please try again.")
                    .build();
        }
    }

    private String extractResponseContent(String response) {
        try {
            ObjectMapper mapper = new ObjectMapper();
            JsonNode rootNode = mapper.readTree(response);
            return rootNode.path("candidates")
                    .get(0)
                    .path("content")
                    .path("parts")
                    .get(0)
                    .path("text")
                    .asText();
        } catch (Exception e) {
            return "Error processing request: " + e.getMessage();
        }
    }
}