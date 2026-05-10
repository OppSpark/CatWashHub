package com.catwashhub.controller;

import com.catwashhub.common.ApiResponse;
import com.catwashhub.dto.request.CommentRequest;
import com.catwashhub.dto.request.CommentUpdateRequest;
import com.catwashhub.dto.request.PostRequest;
import com.catwashhub.dto.response.CommentResponse;
import com.catwashhub.dto.response.PostResponse;
import com.catwashhub.service.PostService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/posts")
@RequiredArgsConstructor
public class PostController {

    private final PostService m_PostService;

    // 게시글 목록 (검색 지원)
    @GetMapping
    public ResponseEntity<ApiResponse<Page<PostResponse.PostSummary>>> getPosts(
            @RequestParam(required = false) String keyword,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(ApiResponse.ok(
                m_PostService.getPosts(keyword, PageRequest.of(page, size))));
    }

    // 게시글 상세
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<PostResponse>> getPost(
            @AuthenticationPrincipal UserDetails _userDetails,
            @PathVariable Long id,
            jakarta.servlet.http.HttpSession session) {
        return ResponseEntity.ok(ApiResponse.ok(
                m_PostService.getPost(_userDetails.getUsername(), id, session)));
    }

    // 게시글 작성
    @PostMapping
    public ResponseEntity<ApiResponse<PostResponse>> createPost(
            @AuthenticationPrincipal UserDetails _userDetails,
            @RequestBody PostRequest _request) {
        return ResponseEntity.ok(ApiResponse.ok(
                m_PostService.createPost(_userDetails.getUsername(), _request)));
    }

    // 게시글 수정
    @PatchMapping("/{id}")
    public ResponseEntity<ApiResponse<PostResponse>> updatePost(
            @AuthenticationPrincipal UserDetails _userDetails,
            @PathVariable Long id,
            @RequestBody PostRequest _request) {
        return ResponseEntity.ok(ApiResponse.ok(
                m_PostService.updatePost(_userDetails.getUsername(), id, _request)));
    }

    // 게시글 삭제
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deletePost(
            @AuthenticationPrincipal UserDetails _userDetails,
            @PathVariable Long id) {
        m_PostService.deletePost(_userDetails.getUsername(), id);
        return ResponseEntity.ok(ApiResponse.ok());
    }

    // 좋아요 토글
    @PostMapping("/{id}/like")
    public ResponseEntity<ApiResponse<Boolean>> toggleLike(
            @AuthenticationPrincipal UserDetails _userDetails,
            @PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(
                m_PostService.toggleLike(_userDetails.getUsername(), id)));
    }

    // 댓글 목록
    @GetMapping("/{id}/comments")
    public ResponseEntity<ApiResponse<List<CommentResponse>>> getComments(
            @PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(
                m_PostService.getComments(id)));
    }

    // 댓글 작성
    @PostMapping("/{id}/comments")
    public ResponseEntity<ApiResponse<CommentResponse>> createComment(
            @AuthenticationPrincipal UserDetails _userDetails,
            @PathVariable Long id,
            @RequestBody CommentRequest _request) {
        return ResponseEntity.ok(ApiResponse.ok(
                m_PostService.createComment(_userDetails.getUsername(), id, _request)));
    }

    // 댓글 수정
    @PatchMapping("/comments/{commentId}")
    public ResponseEntity<ApiResponse<CommentResponse>> updateComment(
            @AuthenticationPrincipal UserDetails _userDetails,
            @PathVariable Long commentId,
            @RequestBody CommentUpdateRequest _request) {
        return ResponseEntity.ok(ApiResponse.ok(
                m_PostService.updateComment(_userDetails.getUsername(), commentId, _request)));
    }

    // 댓글 삭제
    @DeleteMapping("/comments/{commentId}")
    public ResponseEntity<ApiResponse<Void>> deleteComment(
            @AuthenticationPrincipal UserDetails _userDetails,
            @PathVariable Long commentId) {
        m_PostService.deleteComment(_userDetails.getUsername(), commentId);
        return ResponseEntity.ok(ApiResponse.ok());
    }
}
