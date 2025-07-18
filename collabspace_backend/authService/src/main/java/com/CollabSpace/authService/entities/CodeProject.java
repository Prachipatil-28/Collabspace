// package com.CollabSpace.authService.entities;
package com.CollabSpace.authService.entities;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
@Entity
@Table(name = "code_projects")
public class CodeProject {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String workspaceId;

    @OneToMany(mappedBy = "codeProject", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<File> files = new ArrayList<>();

    @Column(columnDefinition = "TEXT")
    private String code;

    private String language;

    private String owner; // Added owner field
    private LocalDateTime createdAt; // Added creation timestamp

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}