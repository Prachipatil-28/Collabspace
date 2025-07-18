package com.CollabSpace.authService.service;

import com.CollabSpace.authService.dtos.UserDto;
import com.CollabSpace.authService.entities.User;

import java.io.IOException;
import java.util.List;
import java.util.Optional;

public interface UserService {

    //create
    UserDto createUser(UserDto userDto);


    //update
    UserDto updateUser(UserDto userDto, String userId);

    //delete

    void deleteUser(String userId);



    UserDto getUserByUsername(String username);

    List<UserDto> getAllUsers();

    User findUserById(String id);

    void generatePasswordResetToken(String email);

    void resetPassword(String token, String newPassword);

    Optional<User> findByEmail(String email);

    User registerUser(User user);
    //get all users
   // PageableResponse<UserDto> getAllUser(int pageNumber, int pageSize, String sortBy, String sortDir);

    //get single user by id
   // UserDto getUserById(String userId);

    //get  single user by email
   // UserDto getUserByEmail(String email);

    //search user
   // List<UserDto> searchUser(String keyword);

    //other user specific features

}



