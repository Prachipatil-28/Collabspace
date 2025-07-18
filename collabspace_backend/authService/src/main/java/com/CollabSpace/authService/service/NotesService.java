package com.CollabSpace.authService.service;



import com.CollabSpace.authService.dtos.NoteDto;

import java.util.List;

public interface NotesService {
    List<String> getAllNotes(String workspaceId);
    NoteDto getNote(String workspaceId, String noteName);
    void saveNote(String workspaceId, String noteName, String content);
    void createNote(String workspaceId, String noteName);
    NoteDto publishNote(String workspaceId, String noteName, String author);
    String generateAINote(String prompt);
    List<NoteDto> getPublishedNotes();
}
