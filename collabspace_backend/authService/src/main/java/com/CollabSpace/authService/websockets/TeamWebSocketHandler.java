package com.CollabSpace.authService.websockets;


import com.CollabSpace.authService.service.impl.IdeaService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

@Component
public class TeamWebSocketHandler extends TextWebSocketHandler {

    private final IdeaService ideaService;
    private final ObjectMapper objectMapper;

    @Autowired
    public TeamWebSocketHandler(IdeaService ideaService, ObjectMapper objectMapper) {
        this.ideaService = ideaService;
        this.objectMapper = objectMapper;
    }

    @Override
    public void afterConnectionEstablished(WebSocketSession session) throws Exception {
        String path = session.getUri().getPath();
        String workspaceId = extractWorkspaceId(path);
        if (workspaceId != null) {
            ideaService.registerSession(workspaceId, session);
            System.out.println("WebSocket connected for workspace: " + workspaceId);
        } else {
            session.close(CloseStatus.BAD_DATA);
        }
    }

    @Override
    public void handleTextMessage(WebSocketSession session, TextMessage message) throws Exception {
        // Messages are handled by the frontend broadcasting to all clients via IdeaService
        System.out.println("Received message: " + message.getPayload());
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) throws Exception {
        String path = session.getUri().getPath();
        String workspaceId = extractWorkspaceId(path);
        if (workspaceId != null) {
            ideaService.removeSession(workspaceId, session);
            System.out.println("WebSocket disconnected for workspace: " + workspaceId);
        }
    }

    private String extractWorkspaceId(String path) {
        try {
            String[] parts = path.split("/");
            return parts[parts.length - 1];
        } catch (Exception e) {
            return null;
        }
    }
}