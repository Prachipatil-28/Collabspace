package com.CollabSpace.authService.config;

import com.CollabSpace.authService.entities.Role;
import com.CollabSpace.authService.entities.User;
import com.CollabSpace.authService.enums.AppRole;
import com.CollabSpace.authService.enums.Providers;
import com.CollabSpace.authService.repositories.RoleRepository;
import com.CollabSpace.authService.security.JwtHelper;
import com.CollabSpace.authService.service.UserService;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.oauth2.core.user.DefaultOAuth2User;
import org.springframework.security.web.authentication.SavedRequestAwareAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import org.springframework.web.util.UriComponentsBuilder;

import java.io.IOException;
import java.util.*;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class OAuth2LoginSuccessHandler extends SavedRequestAwareAuthenticationSuccessHandler {

    @Autowired
    private final UserService userService;

    @Autowired
    private final JwtHelper helper;

    @Autowired
    private RoleRepository roleRepository;

    @Value("${frontend.url}")
    private String frontendUrl;

    String username;

    String idAttributeKey;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response, Authentication authentication) throws ServletException, IOException {
        OAuth2AuthenticationToken oAuth2AuthenticationToken = (OAuth2AuthenticationToken) authentication;
        if ("github".equals(oAuth2AuthenticationToken.getAuthorizedClientRegistrationId()) || "google".equals(oAuth2AuthenticationToken.getAuthorizedClientRegistrationId())) {
            DefaultOAuth2User principal = (DefaultOAuth2User) authentication.getPrincipal();
            Map<String, Object> attributes = principal.getAttributes();
            String email = attributes.getOrDefault("email", "").toString();
            String name = attributes.getOrDefault("name", "").toString();
            if ("github".equals(oAuth2AuthenticationToken.getAuthorizedClientRegistrationId())) {
                username = attributes.getOrDefault("login", "").toString();
                idAttributeKey = "id";
            } else if ("google".equals(oAuth2AuthenticationToken.getAuthorizedClientRegistrationId())) {
                username = email.split("@")[0];
                idAttributeKey = "sub";
            } else {
                username = "";
                idAttributeKey = "id";
            }
            System.out.println("HELLO OAUTH: " + email + " : " + name + " : " + username);

            userService.findByEmail(email)
                    .ifPresentOrElse(user -> {
                        List<SimpleGrantedAuthority> authorities = user.getRoles().stream()
                                .map(role -> new SimpleGrantedAuthority(role.getRoleName().name())) // Assuming RoleName is an Enum or has a name() method
                                .collect(Collectors.toList());

                        DefaultOAuth2User oauthUser = new DefaultOAuth2User(
                                authorities,
                                attributes,
                                idAttributeKey
                        );
                        Authentication securityAuth = new OAuth2AuthenticationToken(
                                oauthUser,
                                authorities,
                                oAuth2AuthenticationToken.getAuthorizedClientRegistrationId()
                        );
                        SecurityContextHolder.getContext().setAuthentication(securityAuth);
                    }, () -> {
                        User newUser = new User();
                        Optional<Role> userRole = roleRepository.findByRoleName(AppRole.ROLE_USER); // Fetch existing role
                        if (userRole.isPresent()) {
                            newUser.setRoles(userRole.stream().toList()); // Set existing role
                        } else {
                            // Handle the case where the role is not found
                            throw new RuntimeException("Default role not found");
                        }
                        newUser.setEmail(email);
                        newUser.setUserName(username);
                        newUser.setSignUpMethod(Objects.equals(oAuth2AuthenticationToken.getAuthorizedClientRegistrationId(), "github") ? Providers.GITHUB:Providers.GOOGLE);
                        userService.registerUser(newUser);
                        List<SimpleGrantedAuthority> authorities = newUser.getRoles().stream()
                                .map(role -> new SimpleGrantedAuthority(role.getRoleName().name()))
                                .collect(Collectors.toList());

                        DefaultOAuth2User oauthUser = new DefaultOAuth2User(
                                authorities,
                                attributes,
                                idAttributeKey
                        );
                        List<SimpleGrantedAuthority> authorities1 = newUser.getRoles().stream()
                                .map(role -> new SimpleGrantedAuthority(role.getRoleName().name()))
                                .collect(Collectors.toList());

                        Authentication securityAuth = new OAuth2AuthenticationToken(
                                oauthUser,
                                authorities1,
                                oAuth2AuthenticationToken.getAuthorizedClientRegistrationId()
                        );
                        SecurityContextHolder.getContext().setAuthentication(securityAuth);
                    });
        }
        this.setAlwaysUseDefaultTargetUrl(true);

        // JWT TOKEN LOGIC
        DefaultOAuth2User oauth2User = (DefaultOAuth2User) authentication.getPrincipal();
        Map<String, Object> attributes = oauth2User.getAttributes();

        // Extract necessary attributes
        String email = (String) attributes.get("email");
        System.out.println("OAuth2LoginSuccessHandler: " + username + " : " + email);

        Set<SimpleGrantedAuthority> authorities = oauth2User.getAuthorities().stream()
                .map(authority -> new SimpleGrantedAuthority(authority.getAuthority()))
                .collect(Collectors.toSet());

        User user = userService.findByEmail(email).orElseThrow(
                () -> new RuntimeException("User not found"));

        user.getRoles().stream()
                .map(role -> new SimpleGrantedAuthority(role.getRoleName().name()))
                .forEach(authorities::add);
        // Create UserDetailsImpl instance
        User userDetails = new User(
                null,
                username,
                email,
                null,
                false,
                authorities
        );

        // Generate JWT token
        String jwtToken = helper.generateTokenFromUsername(userDetails);

        // Redirect to the frontend with the JWT token
        String targetUrl = UriComponentsBuilder.fromUriString(frontendUrl + "/oauth2/redirect")
                .queryParam("token", jwtToken)
                .build().toUriString();
        this.setDefaultTargetUrl(targetUrl);
        super.onAuthenticationSuccess(request, response, authentication);
    }
}
