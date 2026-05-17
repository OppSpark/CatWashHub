package com.catwashhub.controller;

import com.catwashhub.common.ApiResponse;
import com.catwashhub.dto.request.*;
import com.catwashhub.dto.response.*;
import com.catwashhub.service.GatheringService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/gatherings")
@RequiredArgsConstructor
public class GatheringController {

    private final GatheringService m_GatheringService;

    // ==================== 목록/상세 ====================

    @GetMapping
    public ResponseEntity<ApiResponse<Page<GatheringSummaryResponse>>> getList(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @AuthenticationPrincipal UserDetails _userDetails) {
        Long userId = null;
        if (_userDetails != null) {
            // userId 추출은 서비스 내에서 email로 조회하므로 여기서는 null 처리
        }
        Page<GatheringSummaryResponse> res = m_GatheringService.getList(page, size, userId);
        return ResponseEntity.ok(ApiResponse.ok(res));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<GatheringResponse>> getDetail(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails _userDetails) {
        Long userId = null; // 비로그인도 조회 가능, userId는 북마크/참여여부 표시용
        GatheringResponse res = m_GatheringService.getDetail(id, userId);
        return ResponseEntity.ok(ApiResponse.ok(res));
    }

    // ==================== CRUD ====================

    @PostMapping
    public ResponseEntity<ApiResponse<GatheringResponse>> create(
            @AuthenticationPrincipal UserDetails _userDetails,
            @RequestBody GatheringRequest _req) {
        GatheringResponse res = m_GatheringService.create(_userDetails.getUsername(), _req);
        return ResponseEntity.ok(ApiResponse.ok(res));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<GatheringResponse>> update(
            @AuthenticationPrincipal UserDetails _userDetails,
            @PathVariable Long id,
            @RequestBody GatheringRequest _req) {
        GatheringResponse res = m_GatheringService.update(_userDetails.getUsername(), id, _req);
        return ResponseEntity.ok(ApiResponse.ok(res));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(
            @AuthenticationPrincipal UserDetails _userDetails,
            @PathVariable Long id) {
        m_GatheringService.delete(_userDetails.getUsername(), id);
        return ResponseEntity.ok(ApiResponse.ok(null));
    }

    @PatchMapping("/{id}/close")
    public ResponseEntity<ApiResponse<GatheringResponse>> close(
            @AuthenticationPrincipal UserDetails _userDetails,
            @PathVariable Long id) {
        GatheringResponse res = m_GatheringService.closeGathering(_userDetails.getUsername(), id);
        return ResponseEntity.ok(ApiResponse.ok(res));
    }

    // ==================== 참여 ====================

    @PostMapping("/{id}/participate")
    public ResponseEntity<ApiResponse<GatheringResponse>> participate(
            @AuthenticationPrincipal UserDetails _userDetails,
            @PathVariable Long id,
            @RequestBody GatheringParticipantRequest _req) {
        GatheringResponse res = m_GatheringService.participate(_userDetails.getUsername(), id, _req);
        return ResponseEntity.ok(ApiResponse.ok(res));
    }

    // ==================== 찜하기 ====================

    @PostMapping("/{id}/bookmark")
    public ResponseEntity<ApiResponse<Map<String, Boolean>>> toggleBookmark(
            @AuthenticationPrincipal UserDetails _userDetails,
            @PathVariable Long id) {
        boolean isBookmarked = m_GatheringService.toggleBookmark(_userDetails.getUsername(), id);
        return ResponseEntity.ok(ApiResponse.ok(Map.of("isBookmarked", isBookmarked)));
    }

    // ==================== 댓글 ====================

    @PostMapping("/{id}/comments")
    public ResponseEntity<ApiResponse<GatheringCommentResponse>> addComment(
            @AuthenticationPrincipal UserDetails _userDetails,
            @PathVariable Long id,
            @RequestBody GatheringCommentRequest _req) {
        GatheringCommentResponse res = m_GatheringService.addComment(_userDetails.getUsername(), id, _req);
        return ResponseEntity.ok(ApiResponse.ok(res));
    }

    @DeleteMapping("/comments/{commentId}")
    public ResponseEntity<ApiResponse<Void>> deleteComment(
            @AuthenticationPrincipal UserDetails _userDetails,
            @PathVariable Long commentId) {
        m_GatheringService.deleteComment(_userDetails.getUsername(), commentId);
        return ResponseEntity.ok(ApiResponse.ok(null));
    }

    // ==================== 매너 온도 ====================

    @PostMapping("/{id}/rate")
    public ResponseEntity<ApiResponse<Void>> rateUser(
            @AuthenticationPrincipal UserDetails _userDetails,
            @PathVariable Long id,
            @RequestBody MannerRatingRequest _req) {
        m_GatheringService.rateUser(_userDetails.getUsername(), id, _req);
        return ResponseEntity.ok(ApiResponse.ok(null));
    }

    // ==================== 히스토리/북마크 ====================

    @GetMapping("/my/history")
    public ResponseEntity<ApiResponse<List<GatheringSummaryResponse>>> getMyHistory(
            @AuthenticationPrincipal UserDetails _userDetails) {
        List<GatheringSummaryResponse> res = m_GatheringService.getMyHistory(_userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.ok(res));
    }

    @GetMapping("/my/bookmarks")
    public ResponseEntity<ApiResponse<List<GatheringSummaryResponse>>> getMyBookmarks(
            @AuthenticationPrincipal UserDetails _userDetails) {
        List<GatheringSummaryResponse> res = m_GatheringService.getMyBookmarks(_userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.ok(res));
    }
}
