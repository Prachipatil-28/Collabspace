package com.CollabSpace.authService.controller;



import com.CollabSpace.authService.entities.Idea;
import com.CollabSpace.authService.service.impl.IdeaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/workspace/{workspaceId}/ideas")
public class IdeasController {

    private final IdeaService ideaService;

    @Autowired
    public IdeasController(IdeaService ideaService) {
        this.ideaService = ideaService;
    }

    @PostMapping
    public ResponseEntity<Idea> createIdea(@PathVariable String workspaceId, @RequestBody Idea idea) {
        idea.setWorkspaceId(workspaceId);
        Idea createdIdea = ideaService.createIdea(idea);
        return ResponseEntity.ok(createdIdea);
    }

    @GetMapping
    public ResponseEntity<List<Idea>> getIdeas(@PathVariable String workspaceId) {
        List<Idea> ideas = ideaService.getIdeasByWorkspace(workspaceId);
        return ResponseEntity.ok(ideas);
    }

    @PatchMapping("/{ideaId}/vote")
    public ResponseEntity<Idea> voteIdea(@PathVariable String workspaceId, @PathVariable Long ideaId, @RequestBody String userId) {
        Idea updatedIdea = ideaService.voteIdea(ideaId, userId);
        return ResponseEntity.ok(updatedIdea);
    }

    @DeleteMapping("/{ideaId}")
    public ResponseEntity<Void> deleteIdea(@PathVariable String workspaceId, @PathVariable Long ideaId) {
        ideaService.deleteIdea(ideaId, workspaceId);
        return ResponseEntity.noContent().build();
    }
}
