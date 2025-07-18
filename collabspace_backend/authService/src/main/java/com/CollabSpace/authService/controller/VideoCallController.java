package com.CollabSpace.authService.controller;



import com.CollabSpace.authService.dtos.VideoCallInviteRequest;
import com.CollabSpace.authService.service.impl.VideoCallService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/workspace/{workspaceId}/video-call")
public class VideoCallController {

    @Autowired
    private VideoCallService videoCallService;

    @PostMapping("/invite")
    public ResponseEntity<String> sendVideoCallInvites(
            @PathVariable String workspaceId,
            @Valid @RequestBody VideoCallInviteRequest request) {
        // Ensure workspaceId in path matches request body
        if (!workspaceId.equals(request.getWorkspaceId())) {
            return ResponseEntity.badRequest().body("Workspace ID in path and body must match");
        }

        try {
            videoCallService.sendVideoCallInvitations(request);
            return ResponseEntity.ok("Invitations sent successfully");
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Failed to send invitations: " + e.getMessage());
        }
    }
}
