package com.CollabSpace.authService.dtos;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class NoteDto {
    private String workspaceId;
    private String noteName;
    private String content;
    private String author;
    private LocalDateTime publishedDate;
}