package com.catwashhub.service;

import com.catwashhub.domain.User;
import com.catwashhub.domain.UserCar;
import com.catwashhub.domain.WashSession;
import com.catwashhub.dto.response.PostResponse;
import com.catwashhub.dto.response.UserProfileResponse;
import com.catwashhub.exception.CustomException;
import com.catwashhub.exception.ErrorCode;
import com.catwashhub.repository.PostLikeRepository;
import com.catwashhub.repository.PostRepository;
import com.catwashhub.repository.UserCarRepository;
import com.catwashhub.repository.UserRepository;
import com.catwashhub.repository.WashSessionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository m_UserRepository;
    private final UserCarRepository m_UserCarRepository;
    private final WashSessionRepository m_WashSessionRepository;
    private final PostLikeRepository m_PostLikeRepository;
    private final PostRepository m_PostRepository;

    // ==================== 프로필 조회 ====================

    @Transactional(readOnly = true)
    public UserProfileResponse getProfile(Long _userId) {
        try {
            User user = m_UserRepository.findById(_userId)
                    .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));
            UserCar car = m_UserCarRepository.findByUserId(_userId).orElse(null);
            long washCount = m_WashSessionRepository.countByUserIdAndStatus(_userId, WashSession.Status.DONE);
            long totalPostLikes = m_PostLikeRepository.countByPostUserId(_userId);
            return UserProfileResponse.from(user, car, washCount, totalPostLikes);
        } catch (CustomException e) {
            throw e;
        } catch (Exception e) {
            throw new CustomException(ErrorCode.INTERNAL_SERVER_ERROR);
        }
    }

    // ==================== 유저 게시글 목록 ====================

    @Transactional(readOnly = true)
    public List<PostResponse.PostSummary> getUserPosts(Long _userId) {
        return m_PostRepository.findByUserIdOrderByCreatedAtDesc(_userId)
                .stream()
                .map(PostResponse.PostSummary::from)
                .toList();
    }
}
