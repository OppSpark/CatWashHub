package com.catwashhub.security;

import com.catwashhub.util.JwtUtil;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;

@Component
@RequiredArgsConstructor
public class OAuth2SuccessHandler implements AuthenticationSuccessHandler {

    private final JwtUtil m_JwtUtil;

    // 구글 로그인 성공 후 JWT 발급하여 프론트로 리다이렉트
    @Override
    public void onAuthenticationSuccess(HttpServletRequest request,
                                        HttpServletResponse response,
                                        Authentication authentication) throws IOException {
        OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();
        String email = oAuth2User.getAttribute("email");

        String accessToken = m_JwtUtil.generateAccessToken(email);
        String refreshToken = m_JwtUtil.generateRefreshToken(email);

        String redirectUrl = "http://localhost:5173/oauth2/callback"
                + "?accessToken=" + accessToken
                + "&refreshToken=" + refreshToken;

        response.sendRedirect(redirectUrl);
    }
}
