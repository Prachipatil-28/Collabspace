package com.CollabSpace.authService.entities;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

@Entity
@Table(name = "contents")
@Data
public class Content {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String body;

    @Column(name = "created_date", nullable = false)
    private LocalDateTime createdDate;



    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    // Constructors
    public Content() {
        this.createdDate = LocalDateTime.now();
    }

    public Content(String title, String body, User user) {
        this.title = title;
        this.body = body;
        this.user = user;
        this.createdDate = LocalDateTime.now();
    }


}
