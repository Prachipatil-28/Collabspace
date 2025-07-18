package com.CollabSpace.authService.entities;


import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

@Entity
@Data
@Table(name = "contactUs")
public class Contact {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private String email;
    private String message;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    // Constructors
    public Contact() {
        this.createdAt = LocalDateTime.now();
    }

    public Contact(String name, String email, String message) {
        this();
        this.name = name;
        this.email = email;
        this.message = message;
    }



}
