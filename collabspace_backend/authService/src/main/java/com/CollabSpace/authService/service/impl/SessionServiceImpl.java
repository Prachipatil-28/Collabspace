
package com.CollabSpace.authService.service.impl;

import com.CollabSpace.authService.dtos.SessionDto;
import com.CollabSpace.authService.entities.Session;
import com.CollabSpace.authService.entities.User;
import com.CollabSpace.authService.entities.Workspace;
import com.CollabSpace.authService.repositories.SessionRepository;
import com.CollabSpace.authService.repositories.WorkspaceRepository;
import com.CollabSpace.authService.service.SessionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class SessionServiceImpl implements SessionService {

    @Autowired
    private SessionRepository sessionRepository;

    @Autowired
    private WorkspaceRepository workspaceRepository;

    @Override
    public SessionDto createSession(String workspaceId, SessionDto sessionDto) {
        Workspace workspace = workspaceRepository.findById(workspaceId)
                .orElseThrow(() -> new RuntimeException("Workspace not found"));

        User creator = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();

        Session session = new Session();
        session.setSessionId(sessionDto.getSessionId() != null ? sessionDto.getSessionId() : UUID.randomUUID().toString());
        session.setTitle(sessionDto.getTitle());
        session.setDescription(sessionDto.getDescription());
        session.setStartDate(sessionDto.getStartDate());
        session.setEndDate(sessionDto.getEndDate());
        session.setDurationHours(sessionDto.getDurationHours());
        session.setTask(new Session.Task(sessionDto.getTask().getTitle(), sessionDto.getTask().getDescription()));
        session.setWorkspace(workspace);
        session.setCreator(creator);

        Session savedSession = sessionRepository.save(session);

        SessionDto result = new SessionDto();
        result.setSessionId(savedSession.getSessionId());
        result.setTitle(savedSession.getTitle());
        result.setDescription(savedSession.getDescription());
        result.setStartDate(savedSession.getStartDate());
        result.setEndDate(savedSession.getEndDate());
        result.setDurationHours(savedSession.getDurationHours());
        result.setTask(new SessionDto.TaskDto(savedSession.getTask().getTitle(), savedSession.getTask().getDescription()));
        return result;
    }

    @Override
    public List<SessionDto> getAllSessions(String workspaceId) {
        List<Session> sessions = sessionRepository.findByWorkspaceWorkspaceId(workspaceId);
        return sessions.stream().map(session -> {
            SessionDto dto = new SessionDto();
            dto.setSessionId(session.getSessionId());
            dto.setTitle(session.getTitle());
            dto.setDescription(session.getDescription());
            dto.setStartDate(session.getStartDate());
            dto.setEndDate(session.getEndDate());
            dto.setDurationHours(session.getDurationHours());
            dto.setTask(new SessionDto.TaskDto(session.getTask().getTitle(), session.getTask().getDescription()));
            return dto;
        }).collect(Collectors.toList());
    }
}
