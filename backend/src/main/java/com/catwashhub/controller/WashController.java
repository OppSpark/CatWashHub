package com.catwashhub.controller;

import com.catwashhub.common.ApiResponse;
import com.catwashhub.dto.request.WashSessionRequest;
import com.catwashhub.dto.response.WashDashboardResponse;
import com.catwashhub.dto.response.WashSessionResponse;
import com.catwashhub.service.WashService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/wash")
@RequiredArgsConstructor
public class WashController {

    private final WashService m_WashService;

    @GetMapping("/dashboard")
    public ResponseEntity<ApiResponse<WashDashboardResponse>> getDashboard(
            @AuthenticationPrincipal UserDetails _userDetails) {
        WashDashboardResponse response = m_WashService.getDashboard(_userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<WashSessionResponse>>> getSessions(
            @AuthenticationPrincipal UserDetails _userDetails) {
        List<WashSessionResponse> response = m_WashService.getSessions(_userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<WashSessionResponse>> getSession(
            @AuthenticationPrincipal UserDetails _userDetails,
            @PathVariable Long id) {
        WashSessionResponse response = m_WashService.getSession(_userDetails.getUsername(), id);
        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<WashSessionResponse>> createSession(
            @AuthenticationPrincipal UserDetails _userDetails,
            @RequestBody WashSessionRequest _request) {
        WashSessionResponse response = m_WashService.createSession(_userDetails.getUsername(), _request);
        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<WashSessionResponse>> updateSession(
            @AuthenticationPrincipal UserDetails _userDetails,
            @PathVariable Long id,
            @RequestBody WashSessionRequest _request) {
        WashSessionResponse response = m_WashService.updateSession(_userDetails.getUsername(), id, _request);
        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteSession(
            @AuthenticationPrincipal UserDetails _userDetails,
            @PathVariable Long id) {
        m_WashService.deleteSession(_userDetails.getUsername(), id);
        return ResponseEntity.ok(ApiResponse.ok());
    }
}
