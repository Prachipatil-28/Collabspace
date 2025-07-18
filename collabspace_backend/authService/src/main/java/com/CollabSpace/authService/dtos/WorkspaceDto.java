package com.CollabSpace.authService.dtos;

import lombok.*;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Map;

@AllArgsConstructor
@NoArgsConstructor
@Setter
@Getter
@Builder
public class WorkspaceDto {

    private String workspaceId;
    private String workspaceName;
    private String workspaceDescription;
    private String owner;
    private String type;
    private List<String> participants;
    private Map<String, String> permissions;
    private LocalDate createdDate;
    private LocalTime createdTime;
}