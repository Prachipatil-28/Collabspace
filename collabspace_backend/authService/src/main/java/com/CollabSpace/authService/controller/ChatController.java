package com.CollabSpace.authService.controller;

import com.CollabSpace.authService.dtos.ChatMessageDto;
import com.CollabSpace.authService.service.ChatService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/chat/{workspaceId}")
public class ChatController {
    @Autowired
    private ChatService chatService;

    @PostMapping
    public ResponseEntity<ChatMessageDto> sendMessage(
            @PathVariable String workspaceId,
            @RequestBody ChatMessageDto messageDto) {
        ChatMessageDto savedMessage = chatService.sendMessage(workspaceId, messageDto);
        return ResponseEntity.ok(savedMessage);
    }

    @GetMapping
    public ResponseEntity<List<ChatMessageDto>> getMessages(
            @PathVariable String workspaceId) {
        List<ChatMessageDto> messages = chatService.getMessagesByWorkspace(workspaceId);
        return ResponseEntity.ok(messages);
    }
}