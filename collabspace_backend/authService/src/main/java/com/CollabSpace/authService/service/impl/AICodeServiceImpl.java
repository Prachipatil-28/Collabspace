package com.CollabSpace.authService.service.impl;

import com.CollabSpace.authService.dtos.CodeRequest;
import com.CollabSpace.authService.dtos.CodeResponseDto;
import com.CollabSpace.authService.service.AICodeService;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;

import java.util.Map;

@Service
public class AICodeServiceImpl implements AICodeService {

    private final WebClient webClient;

    @Value("${gemini.api.url}")
    private String geminiApiUrl;
    @Value("${gemini.api.key}")
    private String geminiApiKey;

    public AICodeServiceImpl(WebClient.Builder webClientBuilder) {
        this.webClient = webClientBuilder.build();
    }

    @Override
    public CodeResponseDto generateCode(CodeRequest codeRequest) {
        String prompt = buildPrompt(codeRequest);

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

            return CodeResponseDto.builder()
                    .content(aiResponse)
                    .build();
        } catch (WebClientResponseException e) {
            System.err.println("API returned error: " + e.getStatusCode() + " - " + e.getResponseBodyAsString());
            return CodeResponseDto.builder()
                    .content("We couldn’t generate your code right now. Please try again.")
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

    private String buildPrompt(CodeRequest codeRequest) {
        StringBuilder prompt = new StringBuilder();
        prompt.append("Provide a detailed explanation of \"")
                .append(codeRequest.getPrompt())
                .append("\" in ")
                .append(codeRequest.getLanguage()) // Assuming CodeRequest has a language field
                .append(", including what it is and how it works, followed by a concise code example in ")
                .append(codeRequest.getLanguage())
                .append(". Format the response with a clear explanation section and a code section marked with ```")
                .append(codeRequest.getLanguage())
                .append("\n<your code here>\n```.");
        return prompt.toString();
    }
}
