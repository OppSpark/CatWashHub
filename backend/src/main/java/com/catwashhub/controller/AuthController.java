package com.catwashhub.controller;

import com.catwashhub.common.ApiResponse;
import com.catwashhub.dto.request.LoginRequest;
import com.catwashhub.dto.request.SignupRequest;
import com.catwashhub.dto.response.AuthResponse;
import com.catwashhub.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService m_AuthService;

    // ==================== 기능별 함수 ====================
    @PostMapping("/signup")
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<?> signup(@RequestBody @Valid SignupRequest _request) {
        m_AuthService.signup(_request);
        return ApiResponse.ok();
    }

    @PostMapping("/login")
    public ApiResponse<AuthResponse> login(@RequestBody @Valid LoginRequest _request) {
        AuthResponse response = m_AuthService.login(_request.email(), _request.password());
        return ApiResponse.ok(response);
    }
}
