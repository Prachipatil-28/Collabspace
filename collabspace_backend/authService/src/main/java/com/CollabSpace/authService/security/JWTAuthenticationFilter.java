package com.CollabSpace.authService.security;

import com.CollabSpace.authService.config.AppConstants;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.MalformedJwtException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Optional;

@Component
public class JWTAuthenticationFilter extends OncePerRequestFilter {


    @Autowired
    private JwtHelper jwtHelper;

    private Logger logger = LoggerFactory.getLogger(JWTAuthenticationFilter.class);


    private final UserDetailsService userDetailsService;

    public JWTAuthenticationFilter(UserDetailsService userDetailsService){
        this.userDetailsService = userDetailsService;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) throws ServletException, IOException {


        String requestURI = request.getRequestURI();
        System.out.println(request.getHeaderNames());

        if (requestURI.startsWith("/api/auth/public/**")) {
            filterChain.doFilter(request, response);
            return;
        }

        Optional.ofNullable(request.getHeader(AppConstants.JWT_HEADER_NAME))
            .filter(header -> header.startsWith("Bearer "))
            .map(header -> header.substring(7))
            .ifPresentOrElse(token -> {
        //token aa chuka hai
        try {

            //perform operations on token
            Optional.ofNullable(jwtHelper.getUsernameFromToken(token))
                    .ifPresent(username -> {
                        logger.info("Token username is {} ", username);
                        if (SecurityContextHolder.getContext().getAuthentication() == null) {
                            //load user detail form database
                            Optional.ofNullable(userDetailsService.loadUserByUsername(username))
                                    .filter(userDetails -> {
                                        boolean isValidUser = username.equals(userDetails.getUsername());
                                        boolean isTokenValid = !jwtHelper.isTokenExpired(token);
                                        return isTokenValid && isValidUser;

                                    })
                                    .ifPresent(userDetails -> {
                                        var authentication = new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
                                        authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                                        SecurityContextHolder.getContext().setAuthentication(authentication);
                                    });

                        }
                    });


        } catch (IllegalArgumentException ex) {
            logger.info("Illegal Argument while fetching the username !! {}", ex.getMessage());
        } catch (ExpiredJwtException ex) {
            logger.info("Given jwt is expired !! {}", ex.getMessage());
        } catch (MalformedJwtException ex) {
            logger.info("Some changes have been done to the token !! Invalid Token {}", ex.getMessage());
        } catch (Exception ex) {
            logger.error("An unexpected error occurred while processing the token", ex);
        }

    }, () -> {
        //value empty
        logger.info("Invalid Header !! Header is not starting with Bearer");
    });
        filterChain.doFilter(request, response);
}

}
