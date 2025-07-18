package com.CollabSpace.authService.service.impl;

import com.CollabSpace.authService.dtos.RefreshTokenDto;
import com.CollabSpace.authService.dtos.UserDto;
import com.CollabSpace.authService.entities.RefreshToken;
import com.CollabSpace.authService.entities.User;
import com.CollabSpace.authService.exception.ResourceNotFoundException;
import com.CollabSpace.authService.repositories.RefreshTokenRepository;
import com.CollabSpace.authService.repositories.UserRepository;
import com.CollabSpace.authService.service.RefreshTokenService;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.UUID;

@Service
public class RefreshTokenServiceImpl implements RefreshTokenService {
    private UserRepository userRepository;

    private RefreshTokenRepository refreshTokenRepository;

    private ModelMapper modelMapper;

    public RefreshTokenServiceImpl(UserRepository userRepository, RefreshTokenRepository refreshTokenRepository, ModelMapper modelMapper) {
        this.userRepository = userRepository;
        this.refreshTokenRepository = refreshTokenRepository;
        this.modelMapper = modelMapper;
    }

    @Override
    public RefreshTokenDto createRefreshToken(String username) {

        User user = userRepository.findByEmail(username).orElseThrow(() -> new ResourceNotFoundException("User not found !!"));

        RefreshToken refreshToken = refreshTokenRepository.findByUser(user).orElse(null);

        if (refreshToken == null) {
            refreshToken = RefreshToken.builder()
                    .user(user)
                    .token(UUID.randomUUID().toString())
                    .expiryDate(Instant.now().plusSeconds(5 * 24 * 60 * 60))
                    .build();
        } else {
            refreshToken.setToken(UUID.randomUUID().toString());
            refreshToken.setExpiryDate(Instant.now().plusSeconds(5 * 24 * 60 * 60));
        }
        RefreshToken savedToken = refreshTokenRepository.save(refreshToken);
        return this.modelMapper.map(savedToken, RefreshTokenDto.class);


    }

    @Override
    public RefreshTokenDto findByToken(String token) {
        RefreshToken refreshToken = refreshTokenRepository.findByToken(token).orElseThrow(() -> new ResourceNotFoundException("Refresh  token not found in database!!"));
        return this.modelMapper.map(refreshToken, RefreshTokenDto.class);
    }

    @Override
    public RefreshTokenDto verifyRefreshToken(RefreshTokenDto token) {


        var refreshToken = modelMapper.map(token, RefreshToken.class);

        if (token.getExpiryDate().compareTo(Instant.now()) < 0) {
            refreshTokenRepository.delete(refreshToken);
            throw new RuntimeException("Refresh Token Expired !!");

        }
        return token;
    }

    @Override
    public UserDto getUser(RefreshTokenDto dto) {
        RefreshToken refreshToken = refreshTokenRepository.findByToken(dto.getToken()).orElseThrow(()->  new ResourceNotFoundException("Token not found"));
        User user = refreshToken.getUser();
        return modelMapper.map(user, UserDto.class);
    }
}
