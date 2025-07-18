package com.CollabSpace.authService.repositories;

import com.CollabSpace.authService.entities.ChatMessage;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {
    List<ChatMessage> findByWorkspaceWorkspaceIdOrderByTimestampAsc(String workspaceId);
}