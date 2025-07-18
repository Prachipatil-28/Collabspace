package com.CollabSpace.authService.dtos;


import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class CodeResponseDto {
    private String content;
}