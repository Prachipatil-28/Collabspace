package com.CollabSpace.authService.dtos;

import lombok.*;

import java.time.LocalDateTime;

@AllArgsConstructor
@NoArgsConstructor
@Setter
@Getter
@Builder
public class ChatMessageDto {
    private Long id;
    private String content;
    private String sender;
    private LocalDateTime timestamp;
    private String workspaceId;
}