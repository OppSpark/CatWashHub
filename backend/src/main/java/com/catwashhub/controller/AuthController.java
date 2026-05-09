package com.catwashhub.controller;

import com.catwashhub.common.ApiResponse;
import com.catwashhub.dto.request.LoginRequest;
import com.catwashhub.dto.request.SignupRequest;
import com.catwashhub.dto.request.UpdateNicknameRequest;
import com.catwashhub.dto.request.UpdatePasswordRequest;
import com.catwashhub.dto.response.AuthResponse;
import com.catwashhub.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
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

    @PatchMapping("/nickname")
    public ApiResponse<AuthResponse> updateNickname(
            @AuthenticationPrincipal UserDetails _userDetails,
            @RequestBody @Valid UpdateNicknameRequest _request) {
        AuthResponse response = m_AuthService.updateNickname(_userDetails.getUsername(), _request);
        return ApiResponse.ok(response);
    }

    @PatchMapping("/password")
    public ApiResponse<?> updatePassword(
            @AuthenticationPrincipal UserDetails _userDetails,
            @RequestBody @Valid UpdatePasswordRequest _request) {
        m_AuthService.updatePassword(_userDetails.getUsername(), _request);
        return ApiResponse.ok();
    }

    @DeleteMapping("/account")
    public ApiResponse<?> deleteAccount(@AuthenticationPrincipal UserDetails _userDetails) {
        m_AuthService.deleteAccount(_userDetails.getUsername());
        return ApiResponse.ok();
    }
}
