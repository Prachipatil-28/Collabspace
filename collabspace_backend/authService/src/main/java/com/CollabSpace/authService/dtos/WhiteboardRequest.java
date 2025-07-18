package com.CollabSpace.authService.dtos;


import lombok.Data;

import java.util.List;

@Data
public class WhiteboardRequest {
    private String workspaceId;
    private String boardName;
    private List<Object> elements;
}
