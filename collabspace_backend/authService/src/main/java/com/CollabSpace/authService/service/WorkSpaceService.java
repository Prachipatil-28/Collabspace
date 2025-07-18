package com.CollabSpace.authService.service;

import com.CollabSpace.authService.dtos.WorkspaceDto;

import java.util.List;
import java.util.Map;

public interface WorkSpaceService {

    // create
    WorkspaceDto createWorkspace(WorkspaceDto workspaceDto);

    WorkspaceDto deleteWorkspace(String workspaceName, String workspaceId);

    List<WorkspaceDto> getAllWorkspace();

    WorkspaceDto getWorkspace(String workspaceId);

    void joinWorkspace(String workspaceId, String username);


    List<WorkspaceDto> getAllByOwner(String userId);

    List<WorkspaceDto> getAllByUser(String userId);

    Map<String, Object> updatePermissions(String workspaceId, Map<String, String> permissions);
}