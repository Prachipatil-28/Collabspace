package com.CollabSpace.authService.entities;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "ChatMessage")
public class ChatMessage {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String content;
    private String sender; // Email or username
    private LocalDateTime timestamp;

    @ManyToOne
    @JoinColumn(name = "workspace_id")
    private Workspace workspace;
}