package com.CollabSpace.authService.service;

import com.CollabSpace.authService.dtos.ChatMessageDto;

import java.util.List;

public interface ChatService {
    ChatMessageDto sendMessage(String workspaceId, ChatMessageDto messageDto);
    List<ChatMessageDto> getMessagesByWorkspace(String workspaceId);


}