package com.CollabSpace.authService.entities;



import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
@Entity
@Table(name = "ideas")
public class Idea {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false, length = 1000)
    private String description;

    @Column(name = "workspace_id", nullable = false)
    private String workspaceId;

    @Column(name = "created_by", nullable = false)
    private String createdBy;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(nullable = false)
    private Integer votes = 0;

    @ElementCollection
    @CollectionTable(name = "idea_voters", joinColumns = @JoinColumn(name = "idea_id"))
    @Column(name = "voter_id")
    private List<String> voters = new ArrayList<>();

    // Constructors
    public Idea() {}

    public Idea(String title, String description, String workspaceId, String createdBy, LocalDateTime createdAt) {
        this.title = title;
        this.description = description;
        this.workspaceId = workspaceId;
        this.createdBy = createdBy;
        this.createdAt = createdAt;
        this.votes = 0;
        this.voters = new ArrayList<>();
    }


}