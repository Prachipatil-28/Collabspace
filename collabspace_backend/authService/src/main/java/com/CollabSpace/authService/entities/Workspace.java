package com.CollabSpace.authService.entities;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Data
@Entity
@Table(name = "Workspace")
public class Workspace {

    @Id
    private String workspaceId;

    private String workspaceName;

    private String workspaceDescription;

    private String owner;

    private String type; // individual, group, team

    @ElementCollection
    @CollectionTable(name = "Workspace_Participants", joinColumns = @JoinColumn(name = "workspace_id"))
    @Column(name = "participant_email")
    private List<String> participants = new ArrayList<>();

    @ElementCollection
    @CollectionTable(name = "Workspace_Permissions", joinColumns = @JoinColumn(name = "workspace_id"))
    @MapKeyColumn(name = "user_id")
    @Column(name = "permission")
    private Map<String, String> permissions = new HashMap<>();

    private LocalDate createdDate;

    private LocalTime createdTime;
}