package org.java_enterprise.backend.api_gateway.storage.utils;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.stereotype.Service;

import java.security.Key;
import java.util.Date;

@Service
public class JwtService {

    @Value("${jwt.secret}")
    private String secretKey;

    private Key key;

    private static final long EXPIRATION_TIME = 1000 * 60 * 60 * 24; // 24 tiếng

    @PostConstruct
    public void init() {
        this.key = Keys.hmacShaKeyFor(secretKey.getBytes());
    }

    public boolean validateToken(String token) {
        try {
            parseToken(token);
            return true;
        } catch (Exception error) {
            System.out.println(error.toString());
            return false;
        }
    }

    private Jws<Claims> parseToken(String token) {
        String tk = token;
        System.out.println("Full:" + tk);
        if (tk.startsWith("Bearer ")) {
            tk = tk.substring(7); // Xóa "Bearer " khỏi đầu token
        }
        System.out.println("Edited:" + tk);
        return Jwts.parserBuilder()
                .setSigningKey(key)
                .build()
                .parseClaimsJws(tk);
    }
}
