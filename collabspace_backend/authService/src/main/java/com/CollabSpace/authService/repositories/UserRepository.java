package com.CollabSpace.authService.repositories;

import com.CollabSpace.authService.entities.User;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User,String> {
    Optional<User> findByEmail(String email);

    Optional<User> findByEmailAndPassword(String email,String password);

    boolean existsByUserName(@NotBlank(message = "Please Enter your user Name") @Pattern(regexp = "^[A-Za-z].{5}" , message = "please try to enter a valid username") String userName);

    boolean existsByEmail(@Email(message = "Enter a valid email!!") String email);

    Optional<User> findByUserName(String userName);
}
