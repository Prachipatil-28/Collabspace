package com.CollabSpace.authService.dtos;


import lombok.Data;

@Data
public class ContactRequest {
    private String name;
    private String email;
    private String message;
}
