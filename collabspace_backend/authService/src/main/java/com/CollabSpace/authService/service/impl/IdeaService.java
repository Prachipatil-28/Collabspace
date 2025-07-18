package com.CollabSpace.authService.service.impl;





import com.CollabSpace.authService.entities.Idea;
import com.CollabSpace.authService.repositories.IdeaRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class IdeaService {

    private final IdeaRepository ideaRepository;
    private final ObjectMapper objectMapper;
    private final Map<String, List<WebSocketSession>> workspaceSessions;

    @Autowired
    public IdeaService(IdeaRepository ideaRepository, ObjectMapper objectMapper) {
        this.ideaRepository = ideaRepository;
        this.objectMapper = objectMapper;
        this.workspaceSessions = new ConcurrentHashMap<>();
    }

    public Idea createIdea(Idea idea) {
        idea.setCreatedAt(LocalDateTime.now());
        Idea savedIdea = ideaRepository.save(idea);
        broadcastIdeaUpdate(savedIdea.getWorkspaceId(), "IDEA_CREATED", savedIdea);
        return savedIdea;
    }

    public List<Idea> getIdeasByWorkspace(String workspaceId) {
        return ideaRepository.findByWorkspaceId(workspaceId);
    }

    public Idea voteIdea(Long ideaId, String userId) {
        Optional<Idea> optionalIdea = ideaRepository.findById(ideaId);
        if (optionalIdea.isPresent()) {
            Idea idea = optionalIdea.get();
            if (!idea.getVoters().contains(userId)) {
                idea.getVoters().add(userId);
                idea.setVotes(idea.getVotes() + 1);
                Idea updatedIdea = ideaRepository.save(idea);
                broadcastIdeaUpdate(idea.getWorkspaceId(), "IDEA_UPDATED", updatedIdea);
                return updatedIdea;
            } else {
                throw new IllegalStateException("User has already voted for this idea");
            }
        } else {
            throw new IllegalArgumentException("Idea not found");
        }
    }

    public void deleteIdea(Long ideaId, String workspaceId) {
        Optional<Idea> optionalIdea = ideaRepository.findById(ideaId);
        if (optionalIdea.isPresent()) {
            ideaRepository.deleteById(ideaId);
            broadcastIdeaUpdate(workspaceId, "IDEA_DELETED", Map.of("id", ideaId));
        } else {
            throw new IllegalArgumentException("Idea not found");
        }
    }

    // Register WebSocket session for a workspace
    public void registerSession(String workspaceId, WebSocketSession session) {
        workspaceSessions.computeIfAbsent(workspaceId, k -> new java.util.ArrayList<>()).add(session);
    }

    // Remove WebSocket session
    public void removeSession(String workspaceId, WebSocketSession session) {
        List<WebSocketSession> sessions = workspaceSessions.get(workspaceId);
        if (sessions != null) {
            sessions.remove(session);
            if (sessions.isEmpty()) {
                workspaceSessions.remove(workspaceId);
            }
        }
    }

    private void broadcastIdeaUpdate(String workspaceId, String type, Object data) {
        List<WebSocketSession> sessions = workspaceSessions.get(workspaceId);
        if (sessions != null) {
            try {
                String message = objectMapper.writeValueAsString(Map.of(
                        "type", type,
                        "data", data,
                        "workspaceId", workspaceId
                ));
                for (WebSocketSession session : sessions) {
                    if (session.isOpen()) {
                        session.sendMessage(new TextMessage(message));
                    }
                }
            } catch (IOException e) {
                e.printStackTrace();
            }
        }
    }
}