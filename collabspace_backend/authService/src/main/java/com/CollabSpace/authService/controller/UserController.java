package com.CollabSpace.authService.controller;

import com.CollabSpace.authService.dtos.ApiResponseMessage;
import com.CollabSpace.authService.dtos.UserDto;
import com.CollabSpace.authService.dtos.UserInfoResponse;
import com.CollabSpace.authService.repositories.UserRepository;
import com.CollabSpace.authService.security.JwtHelper;
import com.CollabSpace.authService.service.UserService;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RequestMapping("/users")
@RestController
public class UserController {
    @Autowired
    private UserService userService;

    @Autowired
    private JwtHelper jwtHelper;

    @Autowired
    private UserRepository userRepository;


    private Logger logger = LoggerFactory.getLogger(UserController.class);



    //update the user information
    @PutMapping("/{userId}")
    public ResponseEntity<UserDto> updateUser(
            @PathVariable("userId") String userId,
            @Valid @RequestBody UserDto userDto
    ) {
        UserDto updatedUserDto = userService.updateUser(userDto, userId);
        return new ResponseEntity<>(updatedUserDto, HttpStatus.OK);
    }

    @GetMapping("/user")
    public ResponseEntity<?> getUserDetails(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        UserDetails userDetails = (UserDetails) authentication.getPrincipal();
        UserDto userDto = userService.getUserByUsername(userDetails.getUsername());

        List<String> roles = userDetails.getAuthorities().stream()
                    .map(GrantedAuthority::getAuthority)
                    .collect(Collectors.toList());

            UserInfoResponse response = new UserInfoResponse(
                    userDto.getUserId(),
                    userDto.getUserName(),
                    userDto.getEmail(),
                    userDto.isAccountNonLocked(),
                    userDto.isAccountNonExpired(),
                    userDto.isCredentialsNonExpired(),
                    userDto.isEnabled(),
                    userDto.getCredentialsExpiryDate(),
                    userDto.getAccountExpiryDate(),
                    userDto.isTwoFactorEnabled(),
                    roles
            );
            return ResponseEntity.ok().body(response);

    }


    //delete
    @DeleteMapping("/{userId}")
    public ResponseEntity<ApiResponseMessage> deleteUser(@PathVariable String userId) {
        userService.deleteUser(userId);
        ApiResponseMessage message
                = ApiResponseMessage
                .builder()
                .message("User is deleted Successfully !!")
                .success(true)
                .status(HttpStatus.OK)
                .build();

        return new ResponseEntity<>(message, HttpStatus.OK);
    }

    @GetMapping("/all")
    public ResponseEntity<?> getAllUsers(){
        List<UserDto> users = userService.getAllUsers();
        return ResponseEntity.ok(users);
    }

}
