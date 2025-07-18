package com.CollabSpace.authService.service.impl;


import com.CollabSpace.authService.dtos.VideoCallInviteRequest;
import com.CollabSpace.authService.dtos.WorkspaceDto;
import com.CollabSpace.authService.entities.Workspace;
import com.CollabSpace.authService.service.WorkSpaceService;
import com.CollabSpace.authService.utils.EmailService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import jakarta.mail.internet.MimeMessage;

import java.util.HashMap;
import java.util.Map;

@Service
public class VideoCallService {

    @Autowired
    private WorkSpaceService workSpaceService;

    @Autowired
    private EmailService emailService;

    public void sendVideoCallInvitations(VideoCallInviteRequest request) throws Exception {

        WorkspaceDto workspace = workSpaceService.getWorkspace(request.getWorkspaceId());


        for (String recipientEmail : request.getRecipients()) {
            // Prepare variables for the Thymeleaf template
            Map<String, Object> variables = new HashMap<>();
            variables.put("user", recipientEmail.split("@")[0]); // Simplified: use username or fetch from DB
            variables.put("workspaceName", workspace.getWorkspaceName());
            variables.put("roomId", request.getRoomId());
            variables.put("password", request.getPassword());

            try {
                emailService.sendEmail(
                        recipientEmail,
                        "You've Been Added to a Workspace!",
                        "video_call_invitation_template", // Name of your Thymeleaf template
                        variables
                );
            } catch (Exception e) {
                e.getMessage();
            }
        }
    }
}
