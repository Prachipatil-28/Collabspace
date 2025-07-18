package com.CollabSpace.authService.dtos;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class SessionDto {
    private String sessionId;
    private String title;
    private String description;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private Integer durationHours;
    private TaskDto task;

    @Data
    public static class TaskDto {
        private String title;
        private String description;

        public TaskDto() {}

        public TaskDto(String title, String description) {
            this.title = title;
            this.description = description;
        }
    }
}
