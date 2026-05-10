package com.catwashhub.service;

import com.catwashhub.domain.Comment;
import com.catwashhub.domain.Post;
import com.catwashhub.domain.PostLike;
import com.catwashhub.domain.User;
import com.catwashhub.dto.request.CommentRequest;
import com.catwashhub.dto.request.PostRequest;
import com.catwashhub.dto.response.CommentResponse;
import com.catwashhub.dto.response.PostResponse;
import com.catwashhub.exception.CustomException;
import com.catwashhub.exception.ErrorCode;
import com.catwashhub.repository.CommentRepository;
import com.catwashhub.repository.PostLikeRepository;
import com.catwashhub.repository.PostRepository;
import com.catwashhub.repository.UserRepository;
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

    // ==================== 게시글 목록 ====================

    @Transactional(readOnly = true)
    public Page<PostResponse.PostSummary> getPosts(Pageable pageable) {
        return m_PostRepository.findAllByOrderByCreatedAtDesc(pageable)
                .map(PostResponse.PostSummary::from);
    }

    // ==================== 게시글 상세 ====================

    @Transactional
    public PostResponse getPost(String _email, Long _postId) {
        User user = getUser(_email);
        Post post = getPostById(_postId);
        post.incrementViewCount();
        boolean likedByMe = m_PostLikeRepository.existsByPostIdAndUserId(_postId, user.getId());
        return PostResponse.from(post, likedByMe);
    }

    // ==================== 게시글 작성 ====================

    @Transactional
    public PostResponse createPost(String _email, PostRequest _request) {
        User user = getUser(_email);
        Post post = Post.builder()
                .user(user)
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
