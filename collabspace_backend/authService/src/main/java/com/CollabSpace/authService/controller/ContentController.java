package com.CollabSpace.authService.controller;


import com.CollabSpace.authService.dtos.ContentDTO;
import com.CollabSpace.authService.service.impl.ContentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/content")
public class ContentController {
    @Autowired
    private ContentService contentService;

    @PostMapping("/create")
    public ResponseEntity<ContentDTO> createContent(@RequestBody ContentDTO contentDTO) {
        ContentDTO createdContent = contentService.createContent(contentDTO);
        return ResponseEntity.ok(createdContent);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ContentDTO> getContentById(@PathVariable Long id) {
        ContentDTO content = contentService.getContentById(id);
        return ResponseEntity.ok(content);
    }

    @GetMapping("/all")
    public ResponseEntity<List<ContentDTO>> getAllContent() {
        List<ContentDTO> contents = contentService.getAllContent();
        return ResponseEntity.ok(contents);
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<ContentDTO>> getContentByUserId(@PathVariable String userId) {
        List<ContentDTO> contents = contentService.getContentByUserId(userId);
        return ResponseEntity.ok(contents);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteContent(@PathVariable Long id) {
        contentService.deleteContent(id);
        return ResponseEntity.noContent().build();
    }
}