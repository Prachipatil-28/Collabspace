package com.CollabSpace.authService.service.impl;



import com.CollabSpace.authService.dtos.NoteDto;
import com.CollabSpace.authService.entities.Notes;
import com.CollabSpace.authService.repositories.NotesRepository;
import com.CollabSpace.authService.service.NotesService;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class NotesServiceImpl implements NotesService {

    @Autowired
    private NotesRepository notesRepository;

    private final WebClient webClient;

    @Value("${gemini.api.url}")
    private String geminiApiUrl;
    @Value("${gemini.api.key}")
    private String geminiApiKey;

    public NotesServiceImpl(WebClient.Builder webClientBuilder) {
        this.webClient = webClientBuilder.build();
    }

    @Override
    public List<String> getAllNotes(String workspaceId) {
        return notesRepository.findByWorkspaceId(workspaceId)
                .stream()
                .map(Notes::getNoteName)
                .collect(Collectors.toList());
    }

    @Override
    public NoteDto getNote(String workspaceId, String noteName) {
        Notes note = notesRepository.findByWorkspaceIdAndNoteName(workspaceId, noteName);
        if (note == null) {
            return NoteDto.builder().content("").build();
        }
        return NoteDto.builder()
                .workspaceId(note.getWorkspaceId())
                .noteName(note.getNoteName())
                .content(note.getContent())
                .author(note.getAuthor())
                .publishedDate(note.getPublishedDate())
                .build();
    }

    @Override
    public void saveNote(String workspaceId, String noteName, String content) {
        Notes note = notesRepository.findByWorkspaceIdAndNoteName(workspaceId, noteName);
        if (note == null) {
            note = new Notes();
            note.setWorkspaceId(workspaceId);
            note.setNoteName(noteName);
        }
        note.setContent(content);
        notesRepository.save(note);
    }

    @Override
    public void createNote(String workspaceId, String noteName) {
        Notes note = new Notes();
        note.setWorkspaceId(workspaceId);
        note.setNoteName(noteName);
        note.setContent("");
        notesRepository.save(note);
    }

    @Override
    public NoteDto publishNote(String workspaceId, String noteName, String author) {
        Notes note = notesRepository.findByWorkspaceIdAndNoteName(workspaceId, noteName);
        if (note != null) {
            note.setAuthor(author);
            note.setPublishedDate(LocalDateTime.now());
            note.setPublished(true);
            notesRepository.save(note);
            return NoteDto.builder()
                    .workspaceId(note.getWorkspaceId())
                    .noteName(note.getNoteName())
                    .content(note.getContent())
                    .author(note.getAuthor())
                    .publishedDate(note.getPublishedDate())
                    .build();
        }
        return null;
    }

    @Override
    public String generateAINote(String prompt) {
        String structuredPrompt = String.format(
                "Generate a detailed note for '%s'. Provide the content in plain text format suitable for a rich text editor like Quill.",
                prompt
        );
        return callGeminiAPI(structuredPrompt);
    }

    @Override
    public List<NoteDto> getPublishedNotes() {
        return notesRepository.findByIsPublishedTrue()
                .stream()
                .map(note -> NoteDto.builder()
                        .workspaceId(note.getWorkspaceId())
                        .noteName(note.getNoteName())
                        .content(note.getContent())
                        .author(note.getAuthor())
                        .publishedDate(note.getPublishedDate())
                        .build())
                .collect(Collectors.toList());
    }

    private String callGeminiAPI(String prompt) {
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
            return extractResponseContent(response);
        } catch (Exception e) {
            return "Failed to generate note: " + e.getMessage();
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
