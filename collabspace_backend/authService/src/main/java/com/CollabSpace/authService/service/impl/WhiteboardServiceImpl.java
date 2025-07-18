package com.CollabSpace.authService.service.impl;


import com.CollabSpace.authService.dtos.WhiteboardListResponse;
import com.CollabSpace.authService.dtos.WhiteboardRequest;
import com.CollabSpace.authService.dtos.WhiteboardResponse;
import com.CollabSpace.authService.service.WhiteboardService;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class WhiteboardServiceImpl implements WhiteboardService {

    private final Map<String, Map<String, Object>> whiteboardStore = new HashMap<>();

    @Override
    public WhiteboardListResponse listWhiteboards(String workspaceId) {
        List<String> boards = whiteboardStore.keySet().stream()
                .filter(key -> key.startsWith(workspaceId + "-"))
                .map(key -> key.replace(workspaceId + "-", ""))
                .collect(Collectors.toList());
        return WhiteboardListResponse.builder().boards(boards).build();
    }

    @Override
    public WhiteboardResponse getWhiteboard(String workspaceId, String boardName) {
        String key = workspaceId + "-" + boardName;
        Map<String, Object> board = whiteboardStore.getOrDefault(key, Map.of("elements", List.of()));
        return WhiteboardResponse.builder().board(board).build();
    }

    @Override
    public WhiteboardResponse saveWhiteboard(WhiteboardRequest request) {
        String key = request.getWorkspaceId() + "-" + request.getBoardName();
        Map<String, Object> boardData = Map.of("elements", request.getElements());
        whiteboardStore.put(key, boardData);
        return WhiteboardResponse.builder().board(boardData).build();
    }

    @Override
    public void deleteWhiteboard(String workspaceId, String boardName) {
        String key = workspaceId + "-" + boardName;
        whiteboardStore.remove(key);
    }
}