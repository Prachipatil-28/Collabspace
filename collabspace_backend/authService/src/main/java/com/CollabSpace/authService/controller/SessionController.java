package com.CollabSpace.authService.controller;

import com.CollabSpace.authService.dtos.SessionDto;
import com.CollabSpace.authService.service.SessionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/session")
public class SessionController {

    @Autowired
    private SessionService sessionService;


    @PostMapping("/{workspaceId}")
    private ResponseEntity<?> createSession(@PathVariable String workspaceId, @RequestBody SessionDto sessionDto){
        SessionDto sessionDto1 = sessionService.createSession(workspaceId,sessionDto);
        return ResponseEntity.ok(sessionDto1);
    }

    @GetMapping("/{workspaceId}")
    public ResponseEntity<List<SessionDto>> getAllSessions(@PathVariable String workspaceId) {
        List<SessionDto> sessions = sessionService.getAllSessions(workspaceId);
        return ResponseEntity.ok(sessions);
    }
}
