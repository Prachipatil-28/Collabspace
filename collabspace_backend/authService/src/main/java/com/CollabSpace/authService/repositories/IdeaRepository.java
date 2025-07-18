package com.CollabSpace.authService.repositories;


import com.CollabSpace.authService.entities.Idea;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface IdeaRepository extends JpaRepository<Idea, Long> {
    List<Idea> findByWorkspaceId(String workspaceId);
}