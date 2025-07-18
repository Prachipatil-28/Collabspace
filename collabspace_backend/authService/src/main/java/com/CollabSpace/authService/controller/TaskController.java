package com.CollabSpace.authService.controller;

import com.CollabSpace.authService.dtos.MessagesResponse;
import com.CollabSpace.authService.dtos.TaskDto;
import com.CollabSpace.authService.service.TaskService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/workspace/{workspaceId}/tasks")
public class TaskController {
    @Autowired
    private TaskService taskService;

    @PostMapping
    public ResponseEntity<TaskDto> createTask(
            @PathVariable String workspaceId,
            @RequestBody TaskDto taskDto) {
        TaskDto createdTask = taskService.createTask(workspaceId, taskDto);
        return ResponseEntity.ok(createdTask);
    }

    @GetMapping("/{taskId}")
    public ResponseEntity<TaskDto> getTask(
            @PathVariable String workspaceId,
            @PathVariable Long taskId) {
        TaskDto task = taskService.getTask(workspaceId, taskId);
        return ResponseEntity.ok(task);
    }
    @DeleteMapping("/{taskId}")
    public ResponseEntity<?> deleteTask(
            @PathVariable String workspaceId,
            @PathVariable Long taskId) {
         taskService.deleteTask(workspaceId, taskId);
        return new ResponseEntity<>(HttpStatus.OK);
    }

    @PatchMapping("/{taskId}")
    public ResponseEntity<TaskDto> updateTask(
            @PathVariable String workspaceId,
            @PathVariable Long taskId,
            @RequestBody TaskDto taskDto) {
        TaskDto updatedTask = taskService.updateTask(workspaceId, taskId, taskDto);
        return ResponseEntity.ok(updatedTask);
    }

    @GetMapping
    public ResponseEntity<List<TaskDto>> getAllTasks(
            @PathVariable String workspaceId) {
        List<TaskDto> tasks = taskService.getAllTasksByWorkspace(workspaceId);
        return ResponseEntity.ok(tasks);
    }
}