package com.CollabSpace.authService.exception;


import lombok.Builder;

@Builder
public class ResourceNotFoundException extends RuntimeException {

    private String message;

    public ResourceNotFoundException(String message){
        super(message);
    }

    public ResourceNotFoundException(){
        super("Resource Not Found");
    }
}
