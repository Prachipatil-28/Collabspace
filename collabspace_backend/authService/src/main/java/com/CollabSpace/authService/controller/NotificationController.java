package com.CollabSpace.authService.controller;

import com.CollabSpace.authService.dtos.NotificationDto;
import com.CollabSpace.authService.service.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/workspace/{workspaceId}/notifications")
public class NotificationController {
    @Autowired
    private NotificationService notificationService;

    @PostMapping
    public ResponseEntity<NotificationDto> createNotification(
            @PathVariable String workspaceId,
            @RequestBody NotificationDto notificationDto) {
        NotificationDto createdNotification = notificationService.createNotification(workspaceId, notificationDto);
        return ResponseEntity.ok(createdNotification);
    }

    @GetMapping
    public ResponseEntity<List<NotificationDto>> getNotifications(
            @PathVariable String workspaceId) {
        List<NotificationDto> notifications = notificationService.getNotificationsByWorkspace(workspaceId);
        return ResponseEntity.ok(notifications);
    }
}