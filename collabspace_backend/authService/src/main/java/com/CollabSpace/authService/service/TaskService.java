package com.CollabSpace.authService.service;

import com.CollabSpace.authService.dtos.TaskDto;

import java.util.List;

public interface TaskService {
    TaskDto createTask(String workspaceId, TaskDto taskDto);
    TaskDto getTask(String workspaceId, Long taskId);
    TaskDto updateTask(String workspaceId, Long taskId, TaskDto taskDto);
    List<TaskDto> getAllTasksByWorkspace(String workspaceId);

    void deleteTask(String workspaceId, Long taskId);
}