package com.CollabSpace.authService.dtos;


import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import lombok.Data;

import java.util.List;

@Data
public class VideoCallInviteRequest {

    @NotBlank(message = "Workspace ID is required")
    private String workspaceId;

    @NotBlank(message = "Room ID is required")
    private String roomId;

    @NotBlank(message = "Password is required")
    private String password;

    @NotEmpty(message = "At least one recipient email is required")
    private List<String> recipients;


}
