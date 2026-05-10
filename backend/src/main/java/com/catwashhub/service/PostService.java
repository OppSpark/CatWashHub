package com.catwashhub.service;

import com.catwashhub.domain.Comment;
import com.catwashhub.domain.Post;
import com.catwashhub.domain.PostLike;
import com.catwashhub.domain.User;
import com.catwashhub.domain.WashSession;
import com.catwashhub.dto.request.CommentRequest;
import com.catwashhub.dto.request.CommentUpdateRequest;
import com.catwashhub.dto.request.PostRequest;
import com.catwashhub.dto.response.CommentResponse;
import com.catwashhub.dto.response.PostResponse;
import com.catwashhub.exception.CustomException;
import com.catwashhub.exception.ErrorCode;
import com.catwashhub.repository.CommentRepository;
import com.catwashhub.repository.PostLikeRepository;
import com.catwashhub.repository.PostRepository;
import com.catwashhub.repository.UserRepository;
import com.catwashhub.repository.WashSessionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class PostService {

    private final PostRepository m_PostRepository;
    private final PostLikeRepository m_PostLikeRepository;
    private final CommentRepository m_CommentRepository;
    private final UserRepository m_UserRepository;
    private final WashSessionRepository m_WashSessionRepository;

    // ==================== 게시글 목록 ====================

    @Transactional(readOnly = true)
    public Page<PostResponse.PostSummary> getPosts(String _keyword, String _postType, Pageable pageable) {
        if (_keyword != null && !_keyword.isBlank()) {
            Page<Post> result = (_postType != null && !_postType.isBlank())
                    ? m_PostRepository.findByPostTypeAndKeyword(_postType, _keyword, pageable)
                    : m_PostRepository.findByTitleContainingOrContentContainingOrderByCreatedAtDesc(_keyword, _keyword, pageable);
            return result.map(PostResponse.PostSummary::from);
        }
        if (_postType != null && !_postType.isBlank()) {
            return m_PostRepository.findByPostTypeOrderByCreatedAtDesc(_postType, pageable)
                    .map(PostResponse.PostSummary::from);
        }
        return m_PostRepository.findAllByOrderByCreatedAtDesc(pageable)
                .map(PostResponse.PostSummary::from);
    }

    // ==================== 내 세차기록 목록 (게시글 작성용) ====================

    @Transactional(readOnly = true)
    public List<PostResponse.WashSessionEmbed> getMyWashSessions(String _email) {
        User user = getUser(_email);
        return m_WashSessionRepository
                .findByUserIdAndStatusOrderByWashedAtDesc(user.getId(), WashSession.Status.DONE)
                .stream()
                .map(PostResponse.WashSessionEmbed::from)
                .toList();
    }

    // ==================== 게시글 상세 ====================

    @Transactional
    public PostResponse getPost(String _email, Long _postId, jakarta.servlet.http.HttpSession _session) {
        Post post = getPostById(_postId);

        String sessionKey = "viewed_post_" + _postId;
        if (_session.getAttribute(sessionKey) == null) {
            post.incrementViewCount();
            _session.setAttribute(sessionKey, true);
        }

        // 비로그인 시 likedByMe = false
        boolean likedByMe = false;
        if (_email != null) {
            User user = getUser(_email);
            likedByMe = m_PostLikeRepository.existsByPostIdAndUserId(_postId, user.getId());
        }
        return PostResponse.from(post, likedByMe);
    }

    // ==================== 게시글 작성 ====================

    @Transactional
    public PostResponse createPost(String _email, PostRequest _request) {
        User user = getUser(_email);
        WashSession washSession = null;
        if ("WASH_LOG".equals(_request.postType()) && _request.washSessionId() != null) {
            washSession = m_WashSessionRepository.findByIdAndUserId(_request.washSessionId(), user.getId())
                    .orElseThrow(() -> new CustomException(ErrorCode.WASH_SESSION_NOT_FOUND));
        }
        Post post = Post.builder()
                .user(user)
                .postType(_request.postType())
                .washSession(washSession)
                .title(_request.title())
                .content(_request.content())
                .build();
        m_PostRepository.save(post);
        return PostResponse.from(post, false);
    }

    // ==================== 게시글 수정 ====================

    @Transactional
    public PostResponse updatePost(String _email, Long _postId, PostRequest _request) {
        User user = getUser(_email);
        Post post = getPostById(_postId);
        checkPostOwner(post, user.getId());
        post.update(_request.title(), _request.content());
        return PostResponse.from(post, m_PostLikeRepository.existsByPostIdAndUserId(_postId, user.getId()));
    }

    // ==================== 게시글 삭제 ====================

    @Transactional
    public void deletePost(String _email, Long _postId) {
        User user = getUser(_email);
        Post post = getPostById(_postId);
        checkPostOwner(post, user.getId());
        m_PostRepository.delete(post);
    }

    // ==================== 좋아요 토글 ====================

    @Transactional
    public boolean toggleLike(String _email, Long _postId) {
        User user = getUser(_email);
        Post post = getPostById(_postId);

        return m_PostLikeRepository.findByPostIdAndUserId(_postId, user.getId())
                .map(like -> {
                    m_PostLikeRepository.delete(like);
                    return false;
                })
                .orElseGet(() -> {
                    m_PostLikeRepository.save(PostLike.builder().post(post).user(user).build());
                    return true;
                });
    }

    // ==================== 댓글 목록 ====================

    @Transactional(readOnly = true)
    public List<CommentResponse> getComments(Long _postId) {
        return m_CommentRepository.findByPostIdAndParentIsNullOrderByCreatedAtAsc(_postId)
                .stream()
                .map(CommentResponse::from)
                .toList();
    }

    // ==================== 댓글 작성 ====================

    @Transactional
    public CommentResponse createComment(String _email, Long _postId, CommentRequest _request) {
        User user = getUser(_email);
        Post post = getPostById(_postId);

        Comment parent = null;
        if (_request.parentId() != null) {
            parent = m_CommentRepository.findById(_request.parentId())
                    .orElseThrow(() -> new CustomException(ErrorCode.COMMENT_NOT_FOUND));
        }

        Comment comment = Comment.builder()
                .post(post)
                .user(user)
                .parent(parent)
                .content(_request.content())
                .build();
        m_CommentRepository.save(comment);
        return CommentResponse.from(comment);
    }

    // ==================== 댓글 수정 ====================

    @Transactional
    public CommentResponse updateComment(String _email, Long _commentId, CommentUpdateRequest _request) {
        User user = getUser(_email);
        Comment comment = m_CommentRepository.findById(_commentId)
                .orElseThrow(() -> new CustomException(ErrorCode.COMMENT_NOT_FOUND));
        if (!comment.getUser().getId().equals(user.getId())) {
            throw new CustomException(ErrorCode.COMMENT_FORBIDDEN);
        }
        comment.update(_request.content());
        return CommentResponse.from(comment);
    }

    // ==================== 댓글 삭제 ====================

    @Transactional
    public void deleteComment(String _email, Long _commentId) {
        User user = getUser(_email);
        Comment comment = m_CommentRepository.findById(_commentId)
                .orElseThrow(() -> new CustomException(ErrorCode.COMMENT_NOT_FOUND));
        if (!comment.getUser().getId().equals(user.getId())) {
            throw new CustomException(ErrorCode.COMMENT_FORBIDDEN);
        }
        m_CommentRepository.delete(comment);
    }

    // ==================== 초기화 함수 ====================

    private User getUser(String _email) {
        return m_UserRepository.findByEmail(_email)
                .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));
    }

    private Post getPostById(Long _postId) {
        return m_PostRepository.findById(_postId)
                .orElseThrow(() -> new CustomException(ErrorCode.POST_NOT_FOUND));
    }

    private void checkPostOwner(Post _post, Long _userId) {
        if (!_post.getUser().getId().equals(_userId)) {
            throw new CustomException(ErrorCode.POST_FORBIDDEN);
        }
    }
}
