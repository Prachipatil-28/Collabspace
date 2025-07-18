package com.CollabSpace.authService.controller;


import com.CollabSpace.authService.dtos.CodeRequest;
import com.CollabSpace.authService.dtos.CodeResponseDto;
import com.CollabSpace.authService.dtos.DiagramRequest;
import com.CollabSpace.authService.dtos.DiagramResponseDto;
import com.CollabSpace.authService.service.AICodeService;
import com.CollabSpace.authService.service.DiagramService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/ai")
public class AIController {

    @Autowired
    private AICodeService aiService;

    @Autowired
    private DiagramService diagramService;

    @PostMapping("/generate")
    public ResponseEntity<CodeResponseDto> generateCode(@RequestBody CodeRequest codeRequest) {
        CodeResponseDto response = aiService.generateCode(codeRequest);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/generate-diagram")
    public ResponseEntity<DiagramResponseDto> generateDiagram(@RequestBody DiagramRequest request) {
        DiagramResponseDto response = diagramService.generateDiagram(request);
        return ResponseEntity.ok(response);
    }
}
