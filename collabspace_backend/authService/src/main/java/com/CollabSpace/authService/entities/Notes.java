package com.CollabSpace.authService.entities;


import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

@Entity
@Table(name = "notes")
@Data
public class Notes {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "workspace_id", nullable = false)
    private String workspaceId;

    @Column(name = "note_name", nullable = false)
    private String noteName;

    @Column(name = "content", columnDefinition = "TEXT")
    private String content;

    @Column(name = "author")
    private String author;

    @Column(name = "published_date")
    private LocalDateTime publishedDate;

    @Column(name = "is_published", nullable = false)
    private boolean isPublished = false;
}
