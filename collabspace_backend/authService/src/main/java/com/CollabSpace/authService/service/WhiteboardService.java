package com.CollabSpace.authService.service;


import com.CollabSpace.authService.dtos.WhiteboardListResponse;
import com.CollabSpace.authService.dtos.WhiteboardRequest;
import com.CollabSpace.authService.dtos.WhiteboardResponse;

public interface WhiteboardService {
    WhiteboardListResponse listWhiteboards(String workspaceId);
    WhiteboardResponse getWhiteboard(String workspaceId, String boardName);
    WhiteboardResponse saveWhiteboard(WhiteboardRequest request);
    void deleteWhiteboard(String workspaceId, String boardName);
}
