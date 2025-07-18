package com.CollabSpace.authService.entities;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "Task")
public class Task {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;
    private String description;
    private LocalDateTime startDate;
    private LocalDateTime dueDate;
    private String assignedTo; // Email or username; null for group tasks
    private String type; // code, whiteboard, notes
    private String content; // Task content (e.g., code, notes)
    private String status; // Incomplete, Review, Completed
    private String remarks;
    private String createdBy; // User who created the task

    @ManyToOne
    @JoinColumn(name = "workspace_id")
    private Workspace workspace;
}