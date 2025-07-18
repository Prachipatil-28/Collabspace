package com.CollabSpace.authService.entities;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "Session")
public class Session {

    @Id
    private String sessionId;

    private String title;

    private String description;

    private LocalDateTime startDate;

    private LocalDateTime endDate;

    private Integer durationHours;

    @Embedded
    private Task task;

    @ManyToOne
    @JoinColumn(name = "workspace_id")
    private Workspace workspace;

    @ManyToOne
    @JoinColumn(name = "creator_id")
    private User creator;

    @Embeddable
    @Data
    public static class Task {
        @Column(name = "task_title")
        private String title;

        @Column(name = "task_description")
        private String description;

        public Task() {}

        public Task(String title, String description) {
            this.title = title;
            this.description = description;
        }
    }
}
