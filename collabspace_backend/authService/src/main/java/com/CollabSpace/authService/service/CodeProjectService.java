package com.CollabSpace.authService.service;


import com.CollabSpace.authService.dtos.CodeProjectDto;

public interface CodeProjectService {
    CodeProjectDto saveCodeProject(CodeProjectDto codeProjectDto);
    CodeProjectDto getCodeProject(String workspaceId);
}
