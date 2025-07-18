package com.CollabSpace.authService.service;

import com.CollabSpace.authService.dtos.RefreshTokenDto;
import com.CollabSpace.authService.dtos.UserDto;

public interface RefreshTokenService {

    //create
    RefreshTokenDto createRefreshToken(String username);

    // find by token
    RefreshTokenDto findByToken(String token);
//verify

    RefreshTokenDto verifyRefreshToken(RefreshTokenDto refreshTokenDto);

    UserDto getUser(RefreshTokenDto dto);

}
