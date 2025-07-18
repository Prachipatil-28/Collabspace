package com.CollabSpace.authService.dtos;

import lombok.*;

import java.time.LocalDateTime;

@AllArgsConstructor
@NoArgsConstructor
@Setter
@Getter
@Builder
public class NotificationDto {
    private Long id;
    private String message;
    private String sender;
    private String recipient;
    private LocalDateTime timestamp;
    private String workspaceId;
}