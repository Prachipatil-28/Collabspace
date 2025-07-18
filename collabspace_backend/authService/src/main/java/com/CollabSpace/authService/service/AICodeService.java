package com.CollabSpace.authService.service;

import com.CollabSpace.authService.dtos.CodeRequest;
import com.CollabSpace.authService.dtos.CodeResponseDto;

public interface AICodeService {
        CodeResponseDto generateCode(CodeRequest codeRequest);
}
