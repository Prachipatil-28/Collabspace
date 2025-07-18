package com.CollabSpace.authService.service;

import com.CollabSpace.authService.dtos.NotificationDto;

import java.util.List;

public interface NotificationService {
    NotificationDto createNotification(String workspaceId, NotificationDto notificationDto);
    List<NotificationDto> getNotificationsByWorkspace(String workspaceId);
}