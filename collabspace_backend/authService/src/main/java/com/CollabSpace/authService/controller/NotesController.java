package com.CollabSpace.authService.controller;


import com.CollabSpace.authService.dtos.NoteDto;
import com.CollabSpace.authService.service.NotesService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/notes")
public class NotesController {

    @Autowired
    private NotesService notesService;

    @GetMapping("/{workspaceId}/list")
    public List<String> getAllNotes(@PathVariable String workspaceId) {
        return notesService.getAllNotes(workspaceId);
    }

    @GetMapping("/{workspaceId}/{noteName}")
    public NoteDto getNote(@PathVariable String workspaceId, @PathVariable String noteName) {
        return notesService.getNote(workspaceId, noteName);
    }

    @PostMapping("/save")
    public void saveNote(@RequestBody NoteDto noteDto) {
        notesService.saveNote(noteDto.getWorkspaceId(), noteDto.getNoteName(), noteDto.getContent());
    }

    @PostMapping("/{workspaceId}/{noteName}/create")
    public void createNote(@PathVariable String workspaceId, @PathVariable String noteName) {
        notesService.createNote(workspaceId, noteName);
    }

    @PostMapping("/{workspaceId}/{noteName}/publish")
    public NoteDto publishNote(@PathVariable String workspaceId, @PathVariable String noteName, @RequestParam String author) {
        return notesService.publishNote(workspaceId, noteName, author);
    }

    @GetMapping("/published")
    public List<NoteDto> getPublishedNotes() {
        return notesService.getPublishedNotes();
    }

    @PostMapping("/ai/generate-note")
    public NoteDto generateAINote(@RequestBody NoteDto noteDto) {
        String content = notesService.generateAINote(noteDto.getContent());
        return NoteDto.builder().content(content).build();
    }
}
