package com.CollabSpace.authService.repositories;

import com.CollabSpace.authService.entities.Session;
import com.CollabSpace.authService.entities.Workspace;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SessionRepository extends JpaRepository<Session,String> {
    //List<Session> findByWorkspace(Workspace workspace);

    List<Session> findByWorkspaceWorkspaceId(String workspaceId);
}

