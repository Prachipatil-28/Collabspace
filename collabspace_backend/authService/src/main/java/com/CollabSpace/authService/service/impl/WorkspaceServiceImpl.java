package com.CollabSpace.authService.service.impl;

import com.CollabSpace.authService.dtos.UserDto;
import com.CollabSpace.authService.dtos.WorkspaceDto;
import com.CollabSpace.authService.entities.Workspace;
import com.CollabSpace.authService.repositories.WorkspaceRepository;
import com.CollabSpace.authService.service.UserService;
import com.CollabSpace.authService.service.WorkSpaceService;
import com.CollabSpace.authService.utils.EmailService;
import jakarta.mail.MessagingException;
import org.modelmapper.ModelMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.*;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Service
public class WorkspaceServiceImpl implements WorkSpaceService {
    private static final Pattern EMAIL_PATTERN = Pattern.compile("^[A-Za-z0-9+_.-]+@(.+)$");

    private static final Logger logger = LoggerFactory.getLogger(WorkspaceServiceImpl.class);
    @Autowired
    private ModelMapper mapper;

    @Autowired
    UserService userService;

    @Autowired
    private EmailService emailService;

    @Autowired
    private WorkspaceRepository workspaceRepository;

    @Override
    public WorkspaceDto createWorkspace(WorkspaceDto workspaceDto) {
        workspaceDto.setWorkspaceId(UUID.randomUUID().toString());
        workspaceDto.setCreatedDate(LocalDate.now());
        workspaceDto.setCreatedTime(LocalTime.now());


        // Validate participant emails
        if (workspaceDto.getParticipants() != null) {
            for (String participant : workspaceDto.getParticipants()) {
                if (!EMAIL_PATTERN.matcher(participant).matches()) {
                    throw new IllegalArgumentException("Invalid email for participant: " + participant);
                }
            }
        }

        Workspace workspace = mapper.map(workspaceDto, Workspace.class);
        if (workspace.getType().equals("Group") || workspace.getType().equals("Team")) {
            Map<String, String> permissions = new HashMap<>();
            // Set owner's permission to edit
            permissions.put(workspace.getOwner(), "edit");
            // Set participants' permissions to view
            if (workspace.getParticipants() != null) {
                for (String participant : workspace.getParticipants()) {
                    permissions.put(participant, "view");
                }
            }
            workspace.setPermissions(permissions);
        } else {
            // For individual workspaces, only owner has edit permission
            Map<String, String> permissions = new HashMap<>();
            permissions.put(workspace.getOwner(), "edit");
            workspace.setPermissions(permissions);
        }
        Workspace savedWorkspace = workspaceRepository.save(workspace);

        if (workspace.getType().equals("Group") || workspace.getType().equals("Team")) {
            Map<String, Object> emailVariables = Map.of(
                    "workspaceName", savedWorkspace.getWorkspaceName(),
                    "workspaceDescription", savedWorkspace.getWorkspaceDescription(),
                    "owner", savedWorkspace.getOwner()
            );

            for (String participant : workspaceDto.getParticipants()) {
                try {
                    emailService.sendEmail(
                            participant,
                            "You've been added to a new workspace: " + savedWorkspace.getWorkspaceName(),
                            "workspace-email",
                            emailVariables
                    );
                } catch (MessagingException e) {
                    throw new RuntimeException("Failed to send email to " + participant + ": " + e.getMessage());
                }
            }
        }

        return mapper.map(savedWorkspace, WorkspaceDto.class);
    }

    @Override
    public WorkspaceDto deleteWorkspace(String workspaceName, String workspaceId) {
        Workspace workspace = workspaceRepository.findById(workspaceId)
                .orElseThrow(() -> new RuntimeException("Workspace not found with ID: " + workspaceId));

        if (!workspace.getWorkspaceName().equals(workspaceName)) {
            throw new RuntimeException("Workspace name does not match the provided ID.");
        }

        workspaceRepository.delete(workspace);

        Map<String, Object> emailVariables = Map.of(
                "workspaceName", workspace.getWorkspaceName(),
                "owner", workspace.getOwner()
        );

        for (String participant : workspace.getParticipants()) {
            try {
                emailService.sendEmail(
                        participant,
                        "Workspace " + workspace.getWorkspaceName() + " has been deleted",
                        "workspace-deleted",
                        emailVariables
                );
            } catch (MessagingException e) {
                throw new RuntimeException("Failed to send deletion email to " + participant + ": " + e.getMessage());
            }
        }

        return mapToDto(workspace);
    }

    @Override
    public List<WorkspaceDto> getAllWorkspace() {
        return workspaceRepository.findAll().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Override
    public WorkspaceDto getWorkspace(String workspaceId) {
        Workspace workspace = workspaceRepository.findById(workspaceId)
                .orElseThrow(() -> new RuntimeException("Workspace not found with ID: " + workspaceId));
        return mapToDto(workspace);
    }

    @Override
    public void joinWorkspace(String workspaceId, String username) {
        Workspace workspace = workspaceRepository.findById(workspaceId)
                .orElseThrow(() -> new RuntimeException("Workspace not found"));
        if (!EMAIL_PATTERN.matcher(username).matches()) {
            throw new IllegalArgumentException("Invalid email: " + username);
        }
        if (workspace.getType().equals("Individual")) {
            throw new IllegalStateException("Cannot join individual workspace");
        }
        if (!workspace.getParticipants().contains(username)) {
            workspace.getParticipants().add(username);
            workspaceRepository.save(workspace);
        }
    }

    @Override
    public List<WorkspaceDto> getAllByOwner(String userId) {
        return workspaceRepository.findByOwner(userId).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Override
    public List<WorkspaceDto> getAllByUser(String userId) {
        List<Workspace> workspaces = workspaceRepository.findByParticipantsContainingAndNotOwner(userId);
        System.out.println("Joined workspaces for userId " + userId + ": " + workspaces);
        return workspaces.stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Override
    public Map<String, Object> updatePermissions(String workspaceId, Map<String, String> permissions) {
        Workspace workspace = workspaceRepository.findById(workspaceId)
                .orElseThrow(() -> new RuntimeException("Workspace not found with ID: " + workspaceId));

        String currentUserId = getCurrentUserId();
        UserDto user = userService.getUserByUsername(currentUserId);
        if (!workspace.getOwner().equals(user.getUserId())) {
            throw new RuntimeException("Only the workspace owner can update permissions");
        }

        Map<String, String> validPermissions = new HashMap<>();
        List<String> skippedUsers = new ArrayList<>();
        for (Map.Entry<String, String> entry : permissions.entrySet()) {
            String userId = entry.getKey();
            String permission = entry.getValue();

            // Validate permission value
            if (!permission.equals("view") && !permission.equals("edit")) {
                logger.warn("Invalid permission value for user {}: {}. Must be 'view' or 'edit'. Skipping.", userId, permission);
                skippedUsers.add(userId);
                continue;
            }

            // Check if user is a participant or owner
            if (userId.equals(workspace.getOwner()) || (workspace.getParticipants() != null && workspace.getParticipants().contains(userId))) {
                validPermissions.put(userId, permission);
            } else {
                logger.warn("User {} is not a participant of workspace {}. Skipping permission update.", userId, workspaceId);
                skippedUsers.add(userId);
            }
        }

        // Ensure owner's permission is always edit
        validPermissions.put(workspace.getOwner(), "edit");

        // Update permissions
        workspace.setPermissions(validPermissions);
        Workspace updatedWorkspace = workspaceRepository.save(workspace);

        logger.info("Permissions updated for workspace {}: {}", workspaceId, validPermissions);

        // Return response with updated permissions and skipped users
        Map<String, Object> response = new HashMap<>();
        response.put("permissions", validPermissions);
        response.put("skippedUsers", skippedUsers);
        return response;

/*
        Map<String, Object> emailVariables = Map.of(
                "workspaceName", workspace.getWorkspaceName(),
                "owner", workspace.getOwner()
        );

        for (String participant : workspace.getParticipants()) {
            try {
                emailService.sendEmail(
                        participant,
                        "Permissions updated for workspace: " + workspace.getWorkspaceName(),
                        "permissions-updated",
                        emailVariables
                );
            } catch (MessagingException e) {
                throw new RuntimeException("Failed to send permission update email to " + participant + ": " + e.getMessage());
            }
        }*/
    }

    private WorkspaceDto mapToDto(Workspace workspace) {
        return mapper.map(workspace, WorkspaceDto.class);
    }

    private String getCurrentUserId() {
        return SecurityContextHolder.getContext().getAuthentication().getName();
    }
}