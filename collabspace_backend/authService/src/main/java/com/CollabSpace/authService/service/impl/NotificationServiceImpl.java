package com.CollabSpace.authService.service.impl;

import com.CollabSpace.authService.dtos.NotificationDto;
import com.CollabSpace.authService.dtos.UserDto;
import com.CollabSpace.authService.entities.Notification;
import com.CollabSpace.authService.entities.User;
import com.CollabSpace.authService.entities.Workspace;
import com.CollabSpace.authService.repositories.NotificationRepository;
import com.CollabSpace.authService.repositories.WorkspaceRepository;
import com.CollabSpace.authService.service.NotificationService;
import com.CollabSpace.authService.service.UserService;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class NotificationServiceImpl implements NotificationService {
    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private WorkspaceRepository workspaceRepository;

    @Autowired
    UserService userService;

    @Autowired
    private ModelMapper mapper;

    @Autowired
    private JavaMailSender mailSender;

    @Override
    public NotificationDto createNotification(String workspaceId, NotificationDto notificationDto) {
        Workspace workspace = workspaceRepository.findById(workspaceId)
                .orElseThrow(() -> new RuntimeException("Workspace not found with ID: " + workspaceId));

        String currentUserId = getCurrentUserId();
        UserDto user = userService.getUserByUsername(currentUserId);
        System.out.println(currentUserId);
        System.out.println(workspace.getOwner());
       /* if (!workspace.getOwner().equals(user.getUserId())) {
            throw new RuntimeException("Only the workspace owner can send notifications");
        }*/

        Notification notification = mapper.map(notificationDto, Notification.class);
        notification.setWorkspace(workspace);
        notification.setSender(currentUserId);
        notification.setTimestamp(LocalDateTime.now());
        Notification savedNotification = notificationRepository.save(notification);
        return mapper.map(savedNotification, NotificationDto.class);
    }

    @Override
    public List<NotificationDto> getNotificationsByWorkspace(String workspaceId) {
        return notificationRepository.findByWorkspaceWorkspaceIdOrderByTimestampDesc(workspaceId).stream()
                .map(notification -> mapper.map(notification, NotificationDto.class))
                .collect(Collectors.toList());
    }

    private String getCurrentUserId() {
        return SecurityContextHolder.getContext().getAuthentication().getName();
    }

    public void sendNotification(String to, String subject, String body) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(to);
        message.setSubject(subject);
        message.setText(body);
        mailSender.send(message);
    }
}