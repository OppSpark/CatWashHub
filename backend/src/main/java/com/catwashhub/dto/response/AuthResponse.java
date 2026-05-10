package com.catwashhub.dto.response;

public record AuthResponse(
        Long userId,
        String accessToken,
        String refreshToken,
        String nickname,
        String email
) {}
