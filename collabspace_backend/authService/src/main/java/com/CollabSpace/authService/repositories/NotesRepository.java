package com.CollabSpace.authService.repositories;


import com.CollabSpace.authService.entities.Notes;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface NotesRepository extends JpaRepository<Notes, Long> {
    List<Notes> findByWorkspaceId(String workspaceId);
    Notes findByWorkspaceIdAndNoteName(String workspaceId, String noteName);
    List<Notes> findByIsPublishedTrue();
}
