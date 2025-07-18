package com.CollabSpace.authService.service.impl;

import com.CollabSpace.authService.dtos.UserDto;
import com.CollabSpace.authService.entities.PasswordResetToken;
import com.CollabSpace.authService.entities.Role;
import com.CollabSpace.authService.entities.User;
import com.CollabSpace.authService.enums.AppRole;
import com.CollabSpace.authService.enums.Providers;
import com.CollabSpace.authService.exception.ResourceNotFoundException;
import com.CollabSpace.authService.repositories.PasswordResetTokenRepository;
import com.CollabSpace.authService.repositories.RoleRepository;
import com.CollabSpace.authService.repositories.UserRepository;
import com.CollabSpace.authService.service.UserService;
import com.CollabSpace.authService.utils.EmailService;
import org.modelmapper.ModelMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class UserServiceImpl implements UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ModelMapper mapper;

  //  @Value("${user.profile.image.path}")
   // private String imagePath;

    private Logger logger = LoggerFactory.getLogger(UserServiceImpl.class);

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private PasswordResetTokenRepository passwordResetTokenRepository;

    @Autowired
    private EmailService emailService;

    @Value("${frontend.url}")
    String frontendUrl;


    @Override
    public UserDto createUser(UserDto userDto) {
        String userId = UUID.randomUUID().toString();
        userDto.setUserId(userId);
        // dto->entity
        User user = dtoToEntity(userDto);
        System.out.println("Password ----------->" + user.getPassword());
        //password encode
        user.setPassword(passwordEncoder.encode(user.getPassword()));

        //get the normal role or create a role for the new user
        Role role = new Role();
        role.setRoleId(UUID.randomUUID().toString());
        role.setRoleName(AppRole.ROLE_USER);
        Role roleNormal = roleRepository.findByRoleName(AppRole.ROLE_USER).orElse(role);

        user.setRoles(List.of(roleNormal));
        userDto.setAccountNonLocked(true);
        userDto.setAccountNonExpired(true);
        userDto.setCredentialsNonExpired(true);
        userDto.setEnabled(true);
        userDto.setCredentialsExpiryDate(LocalDate.now().plusYears(1));
        userDto.setAccountExpiryDate(LocalDate.now().plusYears(1));
        userDto.setTwoFactorEnabled(false);
        userDto.setSignUpMethod(Providers.SELF);
        User savedUser = userRepository.save(user);
        //entity -> dto
        UserDto newDto = entityToDto(savedUser);
        return newDto;
    }

    @Override
    public UserDto updateUser(UserDto userDto, String userId) {
        User user = userRepository.findById(userId).orElseThrow(() -> new ResourceNotFoundException("User not found with given id !!"));
        user.setUserName(userDto.getUserName());
        //email update

        user.setPassword(passwordEncoder.encode(userDto.getPassword()));
       // user.setImageName(userDto.getImageName());

        // assign normal role to user
        //by detail jo bhi api se user banega usko ham  log normal user banayenge

        //save data
        User updatedUser = userRepository.save(user);
        UserDto updatedDto = entityToDto(updatedUser);
        return updatedDto;
    }

    @Override
    public void deleteUser(String userId) {
        User user = userRepository.findById(userId).orElseThrow(() -> new ResourceNotFoundException("User not found with given id !!"));


        //delete user profile image
        //images/user/abc.png
       /* String fullPath = imagePath + user.getImageName();

        try {
            Path path = Paths.get(fullPath);
            Files.delete(path);
        } catch (NoSuchFileException ex) {
            logger.info("User image not found in folder");
            ex.printStackTrace();
        } catch (IOException e) {
            e.printStackTrace();
        }
*/
        //delete user
        userRepository.delete(user);
    }



    @Override
    public UserDto getUserByUsername(String username) {
        User user = userRepository.findByUserName(username).orElseThrow(() -> new ResourceNotFoundException("User Not Found!"));
        return entityToDto(user);
    }

    @Override
    public List<UserDto> getAllUsers() {
        List<User> users = userRepository.findAll();
        List<UserDto> userDtoList = users.stream().map(
                user -> mapper.map(user, UserDto.class)
        ).toList();
        return userDtoList;
    }

    @Override
    public User findUserById(String id) {
        return userRepository.findById(id).orElseThrow( () -> new ResourceNotFoundException("User not found"));
    }


    private UserDto entityToDto(User savedUser) {

       /* UserDto userDto = UserDto.builder()
                .userId(savedUser.getUserId())
                .name(savedUser.getName())
                .email(savedUser.getEmail())
                .password(savedUser.getPassword())
                .about(savedUser.getAbout())
                .gender(savedUser.getGender())
                .imageName(savedUser.getImageName())
                .build();*/

        return mapper.map(savedUser,UserDto.class);

    }

    private User dtoToEntity(UserDto userDto) {
      /*  User user = User.builder()
                .userId(userDto.getUserId())
                .name(userDto.getName())
                .email(userDto.getEmail())
                .password(userDto.getPassword())
                .about(userDto.getAbout())
                .gender(userDto.getGender())
                .imageName(userDto.getImageName())
                .build();*/

        return mapper.map(userDto,User.class);
    }

    @Override
    public void generatePasswordResetToken(String email){
    User user = userRepository.findByEmail(email).orElseThrow(() -> new ResourceNotFoundException("User not found!"));
    String token = UUID.randomUUID().toString();
    Instant expiryDate = Instant.now().plus(15, ChronoUnit.MINUTES); // Token wil get expired in 15 minutes from the creation.
        PasswordResetToken resetToken = new PasswordResetToken(token,expiryDate,user);
        passwordResetTokenRepository.save(resetToken);
        System.out.println(frontendUrl);
        String reserUrl = frontendUrl + "/reset-password?token=" + token;
        emailService.sendPasswordResetEmail(user.getEmail(),reserUrl);
    }

    @Override
    public void resetPassword(String token, String newPassword) {
        PasswordResetToken resetToken = passwordResetTokenRepository.findByToken(token).orElseThrow(() -> new ResourceNotFoundException("Invalid Password Reset Token"));

        if (resetToken.isUsed()){
            throw new RuntimeException("Password Reset Token has already being used");
        }

        if (resetToken.getExpiryDate().isBefore(Instant.now())){
            throw new RuntimeException("Password Reset Token has expired");
        }

        User user = resetToken.getUser();
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        resetToken.setUsed(true);
        passwordResetTokenRepository.save(resetToken);
    }

    @Override
    public Optional<User> findByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    @Override
    public User registerUser(User user){
        if (user.getPassword() != null)
            user.setPassword(passwordEncoder.encode(user.getPassword()));
        return userRepository.save(user);
    }
}
