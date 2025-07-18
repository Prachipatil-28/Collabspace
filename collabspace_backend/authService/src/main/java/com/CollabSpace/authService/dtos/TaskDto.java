package com.CollabSpace.authService.dtos;

import lombok.*;

import java.time.LocalDateTime;

@AllArgsConstructor
@NoArgsConstructor
@Setter
@Getter
@Builder
public class TaskDto {
    private Long id;
    private String title;
    private String description;
    private LocalDateTime startDate;
    private LocalDateTime dueDate;
    private String assignedTo;
    private String type;
    private String content;
    private String status;
    private String remarks;
    private String createdBy;
    private String workspaceId;
}