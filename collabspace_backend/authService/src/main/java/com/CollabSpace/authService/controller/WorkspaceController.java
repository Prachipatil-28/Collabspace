package com.CollabSpace.authService.controller;

import com.CollabSpace.authService.dtos.JoinRequest;
import com.CollabSpace.authService.dtos.WorkspaceDto;
import com.CollabSpace.authService.entities.User;
import com.CollabSpace.authService.exception.ResourceNotFoundException;
import com.CollabSpace.authService.service.UserService;
import com.CollabSpace.authService.service.WorkSpaceService;
import com.CollabSpace.authService.utils.EmailService;
import jakarta.mail.MessagingException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/workspace")
public class WorkspaceController {
    @Autowired
    private WorkSpaceService workspaceService;

    @Autowired
    private EmailService emailService;

    @Autowired
    private UserService userService;

    @PostMapping("/create")
    public ResponseEntity<WorkspaceDto> createWorkspace(@RequestBody WorkspaceDto workspaceDto) {
        WorkspaceDto createdWorkspace = workspaceService.createWorkspace(workspaceDto);
        if (!workspaceDto.getType().equals("individual")) {
            workspaceDto.getParticipants().forEach(participantEmail -> {
                User owner = userService.findUserById(workspaceDto.getOwner());
                User user = userService.findByEmail(participantEmail).orElseThrow(() -> new ResourceNotFoundException("No participant with provided email: " + participantEmail ));

                Map<String, Object> variables = new HashMap<>();
                variables.put("user", user.getUsername()); // Or fetch actual user details if available
                variables.put("owner", owner.getUsername()); // Assuming WorkspaceDto has a getOwner() method
                variables.put("workspaceName", workspaceDto.getWorkspaceName()); // Assuming WorkspaceDto has a getName() method

                try {
                    emailService.sendEmail(
                            participantEmail,
                            "You've Been Added to a Workspace!",
                            "workspace_invitation_template", // Name of your Thymeleaf template
                            variables
                    );
                    // Optionally log the successful email sending
                    System.out.println("Invitation email sent to: " + participantEmail);

                } catch (MessagingException e) {
                    // Handle the exception appropriately, e.g., log the error
                    System.err.println("Error sending invitation email to: " + participantEmail + " - " + e.getMessage());
                }
            });
        }
        return new ResponseEntity<>(createdWorkspace, HttpStatus.CREATED);
    }

    @GetMapping("/getAll")
    public ResponseEntity<List<WorkspaceDto>> getAllWorkspaces() {
        List<WorkspaceDto> workspaces = workspaceService.getAllWorkspace();
        return ResponseEntity.ok(workspaces);
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<WorkspaceDto>> getAllWorkspacesByUser(@PathVariable String userId) {
        List<WorkspaceDto> workspaces = workspaceService.getAllByOwner(userId);
        return ResponseEntity.ok(workspaces);
    }

    @GetMapping("/user/{userId}/all")
    public ResponseEntity<List<WorkspaceDto>> getAllWorkspacesForUser(@PathVariable String userId) {
        List<WorkspaceDto> workspaces = workspaceService.getAllByUser(userId);
        return ResponseEntity.ok(workspaces);
    }

    @GetMapping("/{workspaceId}")
    public ResponseEntity<WorkspaceDto> getWorkspace(@PathVariable String workspaceId) {
        WorkspaceDto workspace = workspaceService.getWorkspace(workspaceId);
        return new ResponseEntity<>(workspace, HttpStatus.OK);
    }

    @PostMapping("/{workspaceId}/join")
    public ResponseEntity<Void> joinWorkspace(
            @PathVariable String workspaceId,
            @RequestBody JoinRequest request) {
        workspaceService.joinWorkspace(workspaceId, request.getUsername());
        WorkspaceDto updatedWorkspace = workspaceService.getWorkspace(workspaceId);
      /*  if (!updatedWorkspace.getType().equals("individual")) {
            messagingTemplate.convertAndSend(
                    "/topic/workspace/" + workspaceId + "/update",
                    updatedWorkspace
            );
        }*/
        return new ResponseEntity<>(HttpStatus.OK);
    }

    @PostMapping("/{workspaceId}/permissions")
    public ResponseEntity<Map<String, Object>> updatePermissions(
            @PathVariable String workspaceId,
            @RequestBody Map<String, String> permissions) {
        WorkspaceDto workspace = workspaceService.getWorkspace(workspaceId);
        if (workspace.getType().equals("individual")) {
            return new ResponseEntity<>(HttpStatus.FORBIDDEN);
        }

        Map<String, Object> result = workspaceService.updatePermissions(workspaceId, permissions);


        return new ResponseEntity<>(result, HttpStatus.OK);
    }
}