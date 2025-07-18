package com.CollabSpace.authService.service;

import com.CollabSpace.authService.dtos.SessionDto;

import java.util.List;

public interface SessionService {

    SessionDto createSession(String workspaceId, SessionDto sessionDto);

    List<SessionDto> getAllSessions(String workspaceId);
}
