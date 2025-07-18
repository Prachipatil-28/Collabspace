package com.CollabSpace.authService.controller;

import com.CollabSpace.authService.dtos.ApiResponseMessage;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RequestMapping("/api")
@RestController
public class HelloController {

    @GetMapping("/hello")
    public ResponseEntity<ApiResponseMessage> hello(){
        ApiResponseMessage message = ApiResponseMessage.builder()
                .message("Hello World")
                .success(true)
                .status(HttpStatus.OK)
                .build();;
        return new ResponseEntity<>(message, HttpStatus.OK);
    }
}
