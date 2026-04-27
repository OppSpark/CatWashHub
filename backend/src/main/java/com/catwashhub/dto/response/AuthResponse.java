package com.catwashhub.dto.response;

public record AuthResponse(
        String accessToken,
        String refreshToken,
        String nickname,
        String email
) {}
