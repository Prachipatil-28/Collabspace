package com.CollabSpace.authService.repositories;

import com.CollabSpace.authService.entities.Workspace;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Arrays;
import java.util.List;

@Repository
public interface WorkspaceRepository extends JpaRepository<Workspace,String> {

    List<Workspace> findByOwner(String userId);

    List<Workspace> findByOwnerOrParticipantsContaining(String owner, String participant);

    @Query("SELECT w FROM Workspace w JOIN User u ON u.userId = :userId " +
            "WHERE u.email MEMBER OF w.participants AND w.owner != :userId")
    List<Workspace> findByParticipantsContainingAndNotOwner(String userId);
}
