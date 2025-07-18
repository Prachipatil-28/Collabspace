package com.CollabSpace.authService.repositories;

import com.CollabSpace.authService.entities.Task;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TaskRepository extends JpaRepository<Task, Long> {
    List<Task> findByWorkspaceWorkspaceId(String workspaceId);
}