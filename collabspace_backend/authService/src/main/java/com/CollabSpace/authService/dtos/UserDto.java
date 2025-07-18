package com.CollabSpace.authService.dtos;

import com.CollabSpace.authService.entities.Role;
import com.CollabSpace.authService.enums.Interests;
import com.CollabSpace.authService.enums.Providers;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.Enumerated;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Set;


@Data
public class UserDto {

    private String userId;

    @NotBlank(message = "Please Enter your user Name")
    @Pattern(regexp = "^[A-Za-z]\\w{5,29}$" , message = "please try to enter a valid username")
    private String userName;

    @Email(message = "Enter a valid email!!")
    private String email;


    @Size(min=4,max = 8,message = "Password must be min 4 characters to maximum 8 characters")
    @JsonIgnore
    private String password;

    private String profileImage;


    private boolean accountNonLocked;

    private boolean accountNonExpired;

    private boolean credentialsNonExpired;

    private boolean enabled;

    private LocalDate credentialsExpiryDate;

    private LocalDate accountExpiryDate;

    private String twoFactorSecret;

    private boolean isTwoFactorEnabled;

    private Providers signUpMethod;

    private Role role;

    private LocalDateTime createdDate;

    private LocalDateTime updatedDate;


}
