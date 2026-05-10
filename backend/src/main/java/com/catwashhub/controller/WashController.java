package com.catwashhub.controller;

import com.catwashhub.common.ApiResponse;
import com.catwashhub.dto.request.WashCompleteRequest;
import com.catwashhub.dto.request.WashSessionRequest;
import com.catwashhub.dto.request.WashUpdateRequest;
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

    // 대시보드
    @GetMapping("/dashboard")
    public ResponseEntity<ApiResponse<WashDashboardResponse>> getDashboard(
            @AuthenticationPrincipal UserDetails _userDetails) {
        return ResponseEntity.ok(ApiResponse.ok(
                m_WashService.getDashboard(_userDetails.getUsername())));
    }

    // 전체 목록
    @GetMapping
    public ResponseEntity<ApiResponse<List<WashSessionResponse>>> getSessions(
            @AuthenticationPrincipal UserDetails _userDetails) {
        return ResponseEntity.ok(ApiResponse.ok(
                m_WashService.getSessions(_userDetails.getUsername())));
    }

    // 단건 조회
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<WashSessionResponse>> getSession(
            @AuthenticationPrincipal UserDetails _userDetails,
            @PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(
                m_WashService.getSession(_userDetails.getUsername(), id)));
    }

    // 세차 준비 저장 (1차 저장 - PREPARING)
    @PostMapping
    public ResponseEntity<ApiResponse<WashSessionResponse>> createSession(
            @AuthenticationPrincipal UserDetails _userDetails,
            @RequestBody WashSessionRequest _request) {
        return ResponseEntity.ok(ApiResponse.ok(
                m_WashService.createSession(_userDetails.getUsername(), _request)));
    }

    // 세차 준비 수정 (장소/용품 수정 - 아직 PREPARING)
    @PutMapping("/{id}/preparation")
    public ResponseEntity<ApiResponse<WashSessionResponse>> updatePreparation(
            @AuthenticationPrincipal UserDetails _userDetails,
            @PathVariable Long id,
            @RequestBody WashSessionRequest _request) {
        return ResponseEntity.ok(ApiResponse.ok(
                m_WashService.updatePreparation(_userDetails.getUsername(), id, _request)));
    }

    // 완료된 세차 수정
    @PatchMapping("/{id}")
    public ResponseEntity<ApiResponse<WashSessionResponse>> updateSession(
            @AuthenticationPrincipal UserDetails _userDetails,
            @PathVariable Long id,
            @RequestBody WashUpdateRequest _request) {
        return ResponseEntity.ok(ApiResponse.ok(
                m_WashService.updateDone(_userDetails.getUsername(), id, _request)));
    }

    // 후기 작성 완료 (DONE으로 전환)
    @PatchMapping("/{id}/complete")
    public ResponseEntity<ApiResponse<WashSessionResponse>> completeSession(
            @AuthenticationPrincipal UserDetails _userDetails,
            @PathVariable Long id,
            @RequestBody WashCompleteRequest _request) {
        return ResponseEntity.ok(ApiResponse.ok(
                m_WashService.completeSession(_userDetails.getUsername(), id, _request)));
    }

    // 삭제
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteSession(
            @AuthenticationPrincipal UserDetails _userDetails,
            @PathVariable Long id) {
        m_WashService.deleteSession(_userDetails.getUsername(), id);
        return ResponseEntity.ok(ApiResponse.ok());
    }
}
