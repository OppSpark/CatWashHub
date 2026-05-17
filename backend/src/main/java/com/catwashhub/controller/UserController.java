package com.catwashhub.controller;

import com.catwashhub.common.ApiResponse;
import com.catwashhub.dto.response.PostResponse;
import com.catwashhub.dto.response.UserProfileResponse;
import com.catwashhub.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService m_UserService;

    // ==================== 기능별 함수 ====================

    @GetMapping("/{userId}/profile")
    public ApiResponse<UserProfileResponse> getProfile(@PathVariable Long userId) {
        return ApiResponse.ok(m_UserService.getProfile(userId));
    }

    @GetMapping("/{userId}/posts")
    public ApiResponse<List<PostResponse.PostSummary>> getUserPosts(@PathVariable Long userId) {
        return ApiResponse.ok(m_UserService.getUserPosts(userId));
    }
}
