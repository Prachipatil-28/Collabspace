package com.CollabSpace.authService.service.impl;

import com.CollabSpace.authService.dtos.ChatMessageDto;
import com.CollabSpace.authService.entities.ChatMessage;
import com.CollabSpace.authService.entities.Workspace;
import com.CollabSpace.authService.repositories.ChatMessageRepository;
import com.CollabSpace.authService.repositories.WorkspaceRepository;
import com.CollabSpace.authService.service.ChatService;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ChatServiceImpl implements ChatService {
    @Autowired
    private ChatMessageRepository chatMessageRepository;


    @Autowired
    private WorkspaceRepository workspaceRepository;

    @Autowired
    private ModelMapper mapper;

    @Override
    public ChatMessageDto sendMessage(String workspaceId, ChatMessageDto messageDto) {
        Workspace workspace = workspaceRepository.findById(workspaceId)
                .orElseThrow(() -> new RuntimeException("Workspace not found with ID: " + workspaceId));

        String currentUserId = getCurrentUserId();
       // if (!workspace.getParticipants().contains(currentUserId) && !workspace.getOwner().equals(currentUserId)) {
       //     throw new RuntimeException("User is not a participant of the workspace");
       // }

        ChatMessage message = mapper.map(messageDto, ChatMessage.class);
        message.setWorkspace(workspace);
        message.setSender(currentUserId);
        message.setTimestamp(LocalDateTime.now());
        ChatMessage savedMessage = chatMessageRepository.save(message);
        return mapper.map(savedMessage, ChatMessageDto.class);
    }

    @Override
    public List<ChatMessageDto> getMessagesByWorkspace(String workspaceId) {
        return chatMessageRepository.findByWorkspaceWorkspaceIdOrderByTimestampAsc(workspaceId).stream()
                .map(message -> mapper.map(message, ChatMessageDto.class))
                .collect(Collectors.toList());
    }


    private String getCurrentUserId() {
        return SecurityContextHolder.getContext().getAuthentication().getName();
    }
}