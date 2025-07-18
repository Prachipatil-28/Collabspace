// package com.CollabSpace.authService.service.impl;
package com.CollabSpace.authService.service.impl;

import com.CollabSpace.authService.dtos.CodeProjectDto;
import com.CollabSpace.authService.entities.CodeProject;
import com.CollabSpace.authService.entities.File;
import com.CollabSpace.authService.repositories.CodeProjectRepository;
import com.CollabSpace.authService.service.CodeProjectService;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class CodeProjectServiceImpl implements CodeProjectService {

    @Autowired
    private CodeProjectRepository codeProjectRepository;

    @Autowired
    private ModelMapper modelMapper;

    @Override
    public CodeProjectDto saveCodeProject(CodeProjectDto codeProjectDto) {
        CodeProject existingProject = codeProjectRepository.findByWorkspaceId(codeProjectDto.getWorkspaceId())
                .orElse(new CodeProject());

        existingProject.setWorkspaceId(codeProjectDto.getWorkspaceId());
        existingProject.setCode(codeProjectDto.getCode());
        existingProject.setLanguage(codeProjectDto.getLanguage());
        existingProject.setOwner(codeProjectDto.getOwner());

        if (codeProjectDto.getFiles() != null) {
            List<File> files = codeProjectDto.getFiles().stream()
                    .map(fileDto -> {
                        File file = new File();
                        file.setName(fileDto.getName());
                        file.setContent(fileDto.getContent());
                        file.setCodeProject(existingProject);
                        return file;
                    })
                    .collect(Collectors.toList());
            existingProject.getFiles().clear();
            existingProject.getFiles().addAll(files);
        } else {
            existingProject.getFiles().clear();
        }

        CodeProject savedProject = codeProjectRepository.save(existingProject);
        return mapToDto(savedProject);
    }

    @Override
    public CodeProjectDto getCodeProject(String workspaceId) {
        CodeProject project = codeProjectRepository.findByWorkspaceId(workspaceId)
                .orElse(new CodeProject()); // Default empty project
        return mapToDto(project);
    }

    private CodeProjectDto mapToDto(CodeProject project) {
        CodeProjectDto dto = modelMapper.map(project, CodeProjectDto.class);
        if (project.getFiles() != null) {
            List<CodeProjectDto.FileDto> fileDtos = project.getFiles().stream()
                    .map(file -> CodeProjectDto.FileDto.builder()
                            .name(file.getName())
                            .content(file.getContent())
                            .build())
                    .collect(Collectors.toList());
            dto.setFiles(fileDtos);
        }
        System.out.println("Owner from --> Database : " + dto.getOwner());
        dto.setOwner(project.getOwner());
        dto.setCreatedAt(project.getCreatedAt());
        return dto;
    }
}