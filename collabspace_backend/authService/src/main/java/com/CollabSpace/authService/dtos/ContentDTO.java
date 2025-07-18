package com.CollabSpace.authService.dtos;


import lombok.Data;

import java.time.LocalDateTime;

@Data
public class ContentDTO {
    private Long id;
    private String title;
    private String body;
    private LocalDateTime createdDate;
    private String userId;

    // Constructors
    public ContentDTO() {}

    public ContentDTO(Long id, String title, String body, LocalDateTime createdDate, String userId) {
        this.id = id;
        this.title = title;
        this.body = body;
        this.createdDate = createdDate;
        this.userId = userId;
    }

}
