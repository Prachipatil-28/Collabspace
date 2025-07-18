package com.CollabSpace.authService.service;


import com.CollabSpace.authService.dtos.DiagramRequest;
import com.CollabSpace.authService.dtos.DiagramResponseDto;

public interface DiagramService {
    DiagramResponseDto generateDiagram(DiagramRequest diagramRequest);
}
