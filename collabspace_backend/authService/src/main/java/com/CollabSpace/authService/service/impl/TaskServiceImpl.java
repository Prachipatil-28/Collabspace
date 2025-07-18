package com.CollabSpace.authService.service.impl;

import com.CollabSpace.authService.dtos.TaskDto;
import com.CollabSpace.authService.dtos.UserDto;
import com.CollabSpace.authService.entities.Task;
import com.CollabSpace.authService.entities.Workspace;
import com.CollabSpace.authService.repositories.TaskRepository;
import com.CollabSpace.authService.repositories.WorkspaceRepository;
import com.CollabSpace.authService.service.TaskService;
import com.CollabSpace.authService.service.UserService;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class TaskServiceImpl implements TaskService {
    @Autowired
    private TaskRepository taskRepository;

    @Autowired
    private WorkspaceRepository workspaceRepository;

    @Autowired
    private ModelMapper mapper;

    @Autowired
    private UserService userService;

    @Override
    public TaskDto createTask(String workspaceId, TaskDto taskDto) {
        Workspace workspace = workspaceRepository.findById(workspaceId)
                .orElseThrow(() -> new RuntimeException("Workspace not found with ID: " + workspaceId));

        String currentUserId = getCurrentUserId();
        UserDto user = userService.getUserByUsername(currentUserId);
        System.out.println(currentUserId);
        System.out.println(workspace.getOwner());
        if (!workspace.getOwner().equals(user.getUserId())) {
            throw new RuntimeException("Only the workspace owner can send notifications");
        }
        Task task = mapper.map(taskDto, Task.class);
        task.setWorkspace(workspace);
        task.setCreatedBy(currentUserId);
        task.setStatus("Incomplete");
        Task savedTask = taskRepository.save(task);
        return mapper.map(savedTask, TaskDto.class);
    }

    @Override
    public TaskDto getTask(String workspaceId, Long taskId) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Task not found with ID: " + taskId));
        if (!task.getWorkspace().getWorkspaceId().equals(workspaceId)) {
            throw new RuntimeException("Task does not belong to workspace: " + workspaceId);
        }
        return mapper.map(task, TaskDto.class);
    }

    @Override
    public TaskDto updateTask(String workspaceId, Long taskId, TaskDto taskDto) {
        Workspace workspace = workspaceRepository.findById(workspaceId)
                .orElseThrow(() -> new RuntimeException("Workspace not found with ID: " + workspaceId));

        String currentUserId = getCurrentUserId();
        UserDto user = userService.getUserByUsername(currentUserId);
        System.out.println(currentUserId);
        System.out.println(workspace.getOwner());
        if (!workspace.getOwner().equals(user.getUserId())) {
            throw new RuntimeException("Only the workspace owner can send notifications");
        }

        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Task not found with ID: " + taskId));
        if (!task.getWorkspace().getWorkspaceId().equals(workspaceId)) {
            throw new RuntimeException("Task does not belong to workspace: " + workspaceId);
        }

        task.setStatus(taskDto.getStatus());
        task.setRemarks(taskDto.getRemarks());
        Task updatedTask = taskRepository.save(task);
        return mapper.map(updatedTask, TaskDto.class);
    }

    @Override
    public List<TaskDto> getAllTasksByWorkspace(String workspaceId) {
        return taskRepository.findByWorkspaceWorkspaceId(workspaceId).stream()
                .map(task -> mapper.map(task, TaskDto.class))
                .collect(Collectors.toList());
    }

    @Override
    public void deleteTask(String workspaceId, Long taskId) {
        Workspace workspace = workspaceRepository.findById(workspaceId)
                .orElseThrow(() -> new RuntimeException("Workspace not found with ID: " + workspaceId));
        String currentUserId = getCurrentUserId();
        UserDto user = userService.getUserByUsername(currentUserId);
       // System.out.println(currentUserId);
       // System.out.println(workspace.getOwner());
        if (!workspace.getOwner().equals(user.getUserId())) {
            throw new RuntimeException("Only the workspace owner can send notifications");
        }
        taskRepository.deleteById(taskId);
    }

    private String getCurrentUserId() {
        return SecurityContextHolder.getContext().getAuthentication().getName();
    }
}