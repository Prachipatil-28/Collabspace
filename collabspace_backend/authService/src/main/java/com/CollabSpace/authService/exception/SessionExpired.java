package com.CollabSpace.authService.exception;

public class SessionExpired extends RuntimeException {
    public SessionExpired(String message) {
        super(message);
    }
}
