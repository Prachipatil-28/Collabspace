package com.CollabSpace.authService.dtos;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Setter
@Getter
@NoArgsConstructor
@AllArgsConstructor
public class ToolUpdate {
    private String sessionId;
    private String toolName;
    private String content;
}