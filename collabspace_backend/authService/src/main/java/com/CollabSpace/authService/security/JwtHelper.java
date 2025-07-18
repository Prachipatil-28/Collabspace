package com.CollabSpace.authService.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;


@Component
public class JwtHelper {
    public static final long TOKEN_VALIDITY = 5 * 60 * 60 * 1000;


    //
//    2. secret key
    public static final String SECRET_KEY = "asdogfsaogfnsanfosfhwasfnsofnsfsfosianfowehroiwgafsadfwiotbhwfsfnfwhoahwafnsfawofhwqohtwsnfsaf";


    public String generateTokenFromUsername(UserDetails userDetails) {
        String username = userDetails.getUsername();
        String roles = userDetails.getAuthorities().stream()
                .map(authority -> authority.getAuthority())
                .collect(Collectors.joining(","));
        return Jwts.builder()
                .subject(username)
                .claim("roles", roles)
                .issuedAt(new Date())
                .expiration(new Date((new Date()).getTime() + TOKEN_VALIDITY))
                .signWith(getSignInKey())
                .compact();
    }

    //retrieve username from jwt token
    public String getUsernameFromToken(String token) {
        return getClaimFromToken(token, Claims::getSubject);
    }



    public <T> T getClaimFromToken(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = getAllClaimsFromToken(token);
        return claimsResolver.apply(claims);
    }

    //for retrieveing any information from token we will need the secret key
    private Claims getAllClaimsFromToken(String token) {
//        Jwts.parser().setSigningKey(SECRET_KEY).parseClaimsJws(token).getBody();

        // 0.12.5
        //return Jwts.parser().setSigningKey(SECRET_KEY).build().parseClaimsJws(token).getPayload();


//        latest
        //SignatureAlgorithm hs512 = SignatureAlgorithm.HS512;
       //SecretKeySpec secretKeySpec = new SecretKeySpec(SECRET_KEY.getBytes(), hs512.getJcaName());
        return Jwts.parser().verifyWith(getSignInKey()).build().parseClaimsJws(token).getPayload();
    }


    //check if the token has expired
    public Boolean isTokenExpired(String token) {
        final Date expiration = getExpirationDateFromToken(token);
        return expiration.before(new Date());
    }

    //retrieve expiration date from jwt token
    public Date getExpirationDateFromToken(String token) {
        return getClaimFromToken(token, Claims::getExpiration);
    }

    //generate token for user
    public String generateToken(UserDetails userDetails) {
        Map<String, Object> claims = new HashMap<>();
        return doGenerateToken(claims, userDetails.getUsername());
    }

    private String doGenerateToken(Map<String, Object> claims, String subject) {

        return
                Jwts.builder()
                        .claims(claims)
                        .subject(subject)
                        .issuedAt(new Date(System.currentTimeMillis()))
                        .expiration(new Date(System.currentTimeMillis() + TOKEN_VALIDITY))
                        .signWith(getSignInKey())
                        .compact();
    }

    private SecretKey getSignInKey() {
        byte[] bytes = Base64.getDecoder()
                .decode(SECRET_KEY.getBytes(StandardCharsets.UTF_8));
        return new SecretKeySpec(bytes, "HmacSHA256"); }


}
