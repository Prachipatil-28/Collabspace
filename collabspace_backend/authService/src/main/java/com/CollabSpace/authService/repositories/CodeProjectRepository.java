package com.CollabSpace.authService.repositories;



import com.CollabSpace.authService.entities.CodeProject;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface CodeProjectRepository extends JpaRepository<CodeProject, Long> {
    Optional<CodeProject> findByWorkspaceId(String workspaceId);
}

