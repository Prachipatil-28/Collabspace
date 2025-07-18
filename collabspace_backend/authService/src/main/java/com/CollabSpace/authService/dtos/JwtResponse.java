package com.CollabSpace.authService.dtos;

import lombok.*;

@Setter
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class JwtResponse {
    private String token;
    UserDto user;
    //    private String jwtToken;
    private RefreshTokenDto refreshToken;
}

