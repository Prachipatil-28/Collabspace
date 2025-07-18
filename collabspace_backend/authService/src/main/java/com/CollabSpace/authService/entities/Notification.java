package com.CollabSpace.authService.entities;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "Notification")
public class Notification {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String message;
    private String sender; // Email or username
    private String recipient; // Email, username, or "group"
    private LocalDateTime timestamp;

    @ManyToOne
    @JoinColumn(name = "workspace_id")
    private Workspace workspace;
}