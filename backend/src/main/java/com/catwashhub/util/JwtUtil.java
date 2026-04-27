package com.catwashhub.util;

import com.catwashhub.exception.CustomException;
import com.catwashhub.exception.ErrorCode;
import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

@Component
public class JwtUtil {

    private final SecretKey m_SecretKey;
    private final long m_AccessExpiration;
    private final long m_RefreshExpiration;

    public JwtUtil(
            @Value("${jwt.secret}") String _secret,
            @Value("${jwt.access-expiration}") long _accessExpiration,
            @Value("${jwt.refresh-expiration}") long _refreshExpiration
    ) {
        this.m_SecretKey = Keys.hmacShaKeyFor(_secret.getBytes(StandardCharsets.UTF_8));
        this.m_AccessExpiration = _accessExpiration;
        this.m_RefreshExpiration = _refreshExpiration;
    }

    // ==================== 기능별 함수 ====================
    public String generateAccessToken(String _email) {
        return generateToken(_email, m_AccessExpiration);
    }

    public String generateRefreshToken(String _email) {
        return generateToken(_email, m_RefreshExpiration);
    }

    public String getEmailFromToken(String _token) {
        return parseClaims(_token).getSubject();
    }

    public boolean isTokenValid(String _token) {
        try {
            parseClaims(_token);
            return true;
        } catch (CustomException e) {
            return false;
        }
    }

    private String generateToken(String _email, long _expiration) {
        return Jwts.builder()
                .subject(_email)
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + _expiration))
                .signWith(m_SecretKey)
                .compact();
    }

    private Claims parseClaims(String _token) {
        try {
            return Jwts.parser()
                    .verifyWith(m_SecretKey)
                    .build()
                    .parseSignedClaims(_token)
                    .getPayload();
        } catch (ExpiredJwtException e) {
            throw new CustomException(ErrorCode.EXPIRED_TOKEN);
        } catch (JwtException e) {
            throw new CustomException(ErrorCode.INVALID_TOKEN);
        }
    }
}
