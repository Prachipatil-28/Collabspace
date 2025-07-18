package com.CollabSpace.authService.repositories;

import com.CollabSpace.authService.entities.Notification;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface NotificationRepository extends JpaRepository<Notification, Long> {
    List<Notification> findByWorkspaceWorkspaceIdOrderByTimestampDesc(String workspaceId);
}