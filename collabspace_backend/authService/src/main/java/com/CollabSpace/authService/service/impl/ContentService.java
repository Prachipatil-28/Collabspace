package com.CollabSpace.authService.service.impl;



import com.CollabSpace.authService.dtos.ContentDTO;
import com.CollabSpace.authService.entities.Content;
import com.CollabSpace.authService.entities.User;
import com.CollabSpace.authService.exception.ResourceNotFoundException;
import com.CollabSpace.authService.repositories.ContentRepository;
import com.CollabSpace.authService.repositories.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ContentService {
    @Autowired
    private ContentRepository contentRepository;

    @Autowired
    private UserRepository userRepository;

    public ContentDTO createContent(ContentDTO contentDTO) {
        User user = userRepository.findById(contentDTO.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + contentDTO.getUserId()));

        Content content = new Content();
        content.setTitle(contentDTO.getTitle());
        content.setBody(contentDTO.getBody());
        content.setUser(user);


        Content savedContent = contentRepository.save(content);
        return mapToDTO(savedContent);
    }

    public ContentDTO getContentById(Long id) {
        Content content = contentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Content not found with id: " + id));
        return mapToDTO(content);
    }

    public List<ContentDTO> getAllContent() {
        return contentRepository.findAll().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public List<ContentDTO> getContentByUserId(String userId) {
        return contentRepository.findByUserUserId(userId).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public void deleteContent(Long id) {
        Content content = contentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Content not found with id: " + id));
        contentRepository.delete(content);
    }

    private ContentDTO mapToDTO(Content content) {
        ContentDTO dto = new ContentDTO();
        dto.setId(content.getId());
        dto.setTitle(content.getTitle());
        dto.setBody(content.getBody());
        dto.setCreatedDate(content.getCreatedDate());
        dto.setUserId(content.getUser().getUserId());
        return dto;
    }
}