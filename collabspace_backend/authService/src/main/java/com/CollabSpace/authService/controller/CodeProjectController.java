package com.CollabSpace.authService.controller;

import com.CollabSpace.authService.dtos.CodeProjectDto;
import com.CollabSpace.authService.service.CodeProjectService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/code")
public class CodeProjectController {

    @Autowired
    private CodeProjectService codeProjectService;

    @PostMapping("/save")
    public ResponseEntity<CodeProjectDto> saveCode(@RequestBody CodeProjectDto codeProjectDto) {
        System.out.println("Owner -----------------------------> " +  codeProjectDto.getOwner());
        CodeProjectDto savedProject = codeProjectService.saveCodeProject(codeProjectDto);
        return ResponseEntity.ok(savedProject);
    }

    @GetMapping("/{workspaceId}")
    public ResponseEntity<CodeProjectDto> getCode(@PathVariable String workspaceId) {
        CodeProjectDto project = codeProjectService.getCodeProject(workspaceId);
        return ResponseEntity.ok(project);
    }
}