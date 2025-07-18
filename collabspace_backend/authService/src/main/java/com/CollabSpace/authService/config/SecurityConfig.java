package com.CollabSpace.authService.config;



import com.CollabSpace.authService.security.JWTAuthenticationFilter;
import com.CollabSpace.authService.security.JwtAuthenticationEntryPoint;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Lazy;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;

import java.util.List;

@Configuration
@EnableWebSecurity(debug = true)
@EnableMethodSecurity(prePostEnabled = true)
public class SecurityConfig {

    @Autowired
    private JWTAuthenticationFilter filter;
    @Autowired
    private JwtAuthenticationEntryPoint entryPoint;

    @Autowired
    @Lazy
    private OAuth2LoginSuccessHandler oAuth2LoginSuccessHandler;

    //    SecurityFilterChain beans
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity security) throws Exception {
        //configurations

        //urls
        //public koun se protected
        //koun se urls admin, koun se normal user.


        //configuring urls
        //cors ko hame abhi ke lie disable kiy hai
        //isko ham log baad mein sikhenge
//        security.cors(httpSecurityCorsConfigurer -> httpSecurityCorsConfigurer.disable());
        //csrf ko hame abhi ke lie disable kiy hai

        security.cors(httpSecurityCorsConfigurer ->
                httpSecurityCorsConfigurer.configurationSource(new CorsConfigurationSource() {
                    @Override
                    public CorsConfiguration getCorsConfiguration(HttpServletRequest request) {
                        CorsConfiguration corsConfiguration = new CorsConfiguration();

                        // Allow all origins
                        corsConfiguration.setAllowedOriginPatterns(List.of("*"));

                        // Allow all methods
                        corsConfiguration.setAllowedMethods(List.of("GET","POST","PUT","PATCH", "DELETE", "OPTIONS"));

                        // Allow all headers
                        corsConfiguration.setAllowedHeaders(List.of("*"));

                        // Allow credentials
                        corsConfiguration.setAllowCredentials(true);

                        // Set max age
                        corsConfiguration.setMaxAge(3600L);



                        return corsConfiguration;
                    }
                })
        );

        //isko ham log baad mein sikhenge
        security.csrf(AbstractHttpConfigurer::disable);

        security.authorizeHttpRequests(request ->
                        request.requestMatchers(

                                "/workspace/**",
                                "/collection/**",
                                "/session/**",
                                "/ai/**",
                                "/oauth2/**",
                                "/api/content/get/**",
                                "/ws/**",
                                "/ws/team/**",
                                "/api/workspace/{workspaceId}/tasks"
                        ).permitAll()
                                .requestMatchers(HttpMethod.POST,"/workspace/{workspaceId}/permissions").authenticated()
                                .requestMatchers(HttpMethod.POST,"/api/auth/public/**").permitAll()
                                .requestMatchers(HttpMethod.POST,"/api/auh/public/forgot-password").permitAll()
                                .requestMatchers(HttpMethod.POST,"/api/auh/public/reset-password").permitAll()
                                .requestMatchers(HttpMethod.POST,"/api/contact").permitAll()
                                // Specific authenticated endpoints
                        .requestMatchers(HttpMethod.DELETE, "/users/**").hasRole(AppConstants.ROLE_ADMIN)
                        .requestMatchers(HttpMethod.POST, "/api/content/publish").authenticated()
                                .requestMatchers("/api/workspace/{workspaceId}/tasks").authenticated()
                                .requestMatchers("/api/workspace/{workspaceId}/ideas").authenticated()
                                .requestMatchers(HttpMethod.POST,"/api/workspace/{workspaceId}/video-call/invite").authenticated()
                        // User endpoints
                        .requestMatchers(HttpMethod.PUT, "/users/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/users/user", "/users/all").permitAll()

                        // All other requests
                        .anyRequest().authenticated())
                .oauth2Login(oauth2 ->{
                    oauth2.successHandler(oAuth2LoginSuccessHandler);
                });


        //entry point
        security.exceptionHandling(ex -> ex.authenticationEntryPoint(entryPoint));

        //session creation policy
        security.sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS));
        //main -->
        security.addFilterBefore(filter, UsernamePasswordAuthenticationFilter.class);

        return security.build();

    }


    //    password encoder
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }


    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration builder) throws Exception {
        return builder.getAuthenticationManager();
    }



}

