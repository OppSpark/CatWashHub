package com.catwashhub.controller;

import com.catwashhub.common.ApiResponse;
import com.catwashhub.dto.request.UserCarRequest;
import com.catwashhub.dto.response.UserCarResponse;
import com.catwashhub.service.UserCarService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/my/car")
@RequiredArgsConstructor
public class UserCarController {

    private final UserCarService m_UserCarService;

    @GetMapping
    public ResponseEntity<ApiResponse<UserCarResponse>> getMyCar(
            @AuthenticationPrincipal UserDetails _userDetails) {
        return m_UserCarService.getMyCar(_userDetails.getUsername())
                .map(car -> ResponseEntity.ok(ApiResponse.ok(car)))
                .orElse(ResponseEntity.ok(ApiResponse.ok(null)));
    }

    @PutMapping
    public ResponseEntity<ApiResponse<UserCarResponse>> saveMyCar(
            @AuthenticationPrincipal UserDetails _userDetails,
            @RequestBody UserCarRequest _req) {
        UserCarResponse res = m_UserCarService.saveMyCar(_userDetails.getUsername(), _req);
        return ResponseEntity.ok(ApiResponse.ok(res));
    }
}
