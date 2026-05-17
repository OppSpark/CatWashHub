package com.catwashhub.service;

import com.catwashhub.domain.*;
import com.catwashhub.dto.request.*;
import com.catwashhub.dto.response.*;
import com.catwashhub.exception.CustomException;
import com.catwashhub.exception.ErrorCode;
import com.catwashhub.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class GatheringService {

    private final GatheringRepository m_GatheringRepository;
    private final GatheringParticipantRepository m_ParticipantRepository;
    private final GatheringBookmarkRepository m_BookmarkRepository;
    private final GatheringCommentRepository m_CommentRepository;
    private final MannerRatingRepository m_MannerRatingRepository;
    private final UserRepository m_UserRepository;
    private final UserCarRepository m_UserCarRepository;

    // ==================== 벙 조회 ====================

    @Transactional(readOnly = true)
    public Page<GatheringSummaryResponse> getList(int page, int size, Long userId) {
        try {
            return m_GatheringRepository.findAllByOrderByCreatedAtDesc(PageRequest.of(page, size))
                    .map(g -> {
                        int joinCount = m_ParticipantRepository.countByGatheringIdAndStatus(
                                g.getId(), GatheringParticipant.ParticipantStatus.JOIN);
                        boolean isBookmarked = userId != null && m_BookmarkRepository.existsByGatheringIdAndUserId(g.getId(), userId);
                        return GatheringSummaryResponse.from(g, joinCount, isBookmarked);
                    });
        } catch (Exception e) {
            throw new CustomException(ErrorCode.INTERNAL_SERVER_ERROR);
        }
    }

    @Transactional(readOnly = true)
    public GatheringResponse getDetail(Long _gatheringId, Long _userId) {
        try {
            Gathering g = m_GatheringRepository.findById(_gatheringId)
                    .orElseThrow(() -> new CustomException(ErrorCode.INVALID_INPUT));

            UserCar hostCar = m_UserCarRepository.findByUserId(g.getHost().getId()).orElse(null);

            int joinCount = m_ParticipantRepository.countByGatheringIdAndStatus(
                    _gatheringId, GatheringParticipant.ParticipantStatus.JOIN);

            boolean isBookmarked = _userId != null && m_BookmarkRepository.existsByGatheringIdAndUserId(_gatheringId, _userId);

            String myStatus = null;
            if (_userId != null) {
                myStatus = m_ParticipantRepository.findByGatheringIdAndUserId(_gatheringId, _userId)
                        .map(p -> p.getStatus().name())
                        .orElse(null);
            }

            List<GatheringParticipantResponse> participants = m_ParticipantRepository.findByGatheringId(_gatheringId)
                    .stream()
                    .map(p -> {
                        UserCar car = m_UserCarRepository.findByUserId(p.getUser().getId()).orElse(null);
                        return GatheringParticipantResponse.from(p, car);
                    })
                    .toList();

            List<GatheringCommentResponse> comments = m_CommentRepository
                    .findByGatheringIdOrderByCreatedAtAsc(_gatheringId)
                    .stream()
                    .map(GatheringCommentResponse::from)
                    .toList();

            return GatheringResponse.from(g, hostCar, joinCount, isBookmarked, myStatus, participants, comments);
        } catch (CustomException e) {
            throw e;
        } catch (Exception e) {
            throw new CustomException(ErrorCode.INTERNAL_SERVER_ERROR);
        }
    }

    // ==================== 벙 CRUD ====================

    @Transactional
    public GatheringResponse create(String _email, GatheringRequest _req) {
        try {
            User user = getUser(_email);
            Gathering g = Gathering.builder()
                    .host(user)
                    .title(_req.title())
                    .description(_req.description())
                    .gatheringAt(_req.gatheringAt())
                    .location(_req.location())
                    .locationDetail(_req.locationDetail())
                    .maxParticipants(_req.maxParticipants())
                    .showPlate(_req.showPlate())
                    .showCarInfo(_req.showCarInfo())
                    .build();
            m_GatheringRepository.save(g);
            return getDetail(g.getId(), user.getId());
        } catch (CustomException e) {
            throw e;
        } catch (Exception e) {
            throw new CustomException(ErrorCode.INTERNAL_SERVER_ERROR);
        }
    }

    @Transactional
    public GatheringResponse update(String _email, Long _gatheringId, GatheringRequest _req) {
        try {
            User user = getUser(_email);
            Gathering g = m_GatheringRepository.findById(_gatheringId)
                    .orElseThrow(() -> new CustomException(ErrorCode.INVALID_INPUT));
            if (!g.getHost().getId().equals(user.getId())) {
                throw new CustomException(ErrorCode.FORBIDDEN);
            }
            g.update(_req.title(), _req.description(), _req.gatheringAt(),
                    _req.location(), _req.locationDetail(), _req.maxParticipants(),
                    _req.showPlate(), _req.showCarInfo());
            return getDetail(_gatheringId, user.getId());
        } catch (CustomException e) {
            throw e;
        } catch (Exception e) {
            throw new CustomException(ErrorCode.INTERNAL_SERVER_ERROR);
        }
    }

    @Transactional
    public void delete(String _email, Long _gatheringId) {
        try {
            User user = getUser(_email);
            Gathering g = m_GatheringRepository.findById(_gatheringId)
                    .orElseThrow(() -> new CustomException(ErrorCode.INVALID_INPUT));
            if (!g.getHost().getId().equals(user.getId())) {
                throw new CustomException(ErrorCode.FORBIDDEN);
            }
            m_GatheringRepository.delete(g);
        } catch (CustomException e) {
            throw e;
        } catch (Exception e) {
            throw new CustomException(ErrorCode.INTERNAL_SERVER_ERROR);
        }
    }

    @Transactional
    public GatheringResponse closeGathering(String _email, Long _gatheringId) {
        try {
            User user = getUser(_email);
            Gathering g = m_GatheringRepository.findById(_gatheringId)
                    .orElseThrow(() -> new CustomException(ErrorCode.INVALID_INPUT));
            if (!g.getHost().getId().equals(user.getId())) {
                throw new CustomException(ErrorCode.FORBIDDEN);
            }
            g.close();
            return getDetail(_gatheringId, user.getId());
        } catch (CustomException e) {
            throw e;
        } catch (Exception e) {
            throw new CustomException(ErrorCode.INTERNAL_SERVER_ERROR);
        }
    }

    // ==================== 참여 ====================

    @Transactional
    public GatheringResponse participate(String _email, Long _gatheringId, GatheringParticipantRequest _req) {
        try {
            User user = getUser(_email);
            Gathering g = m_GatheringRepository.findById(_gatheringId)
                    .orElseThrow(() -> new CustomException(ErrorCode.INVALID_INPUT));

            GatheringParticipant.ParticipantStatus status =
                    GatheringParticipant.ParticipantStatus.valueOf(_req.status());

            GatheringParticipant participant = m_ParticipantRepository
                    .findByGatheringIdAndUserId(_gatheringId, user.getId())
                    .orElse(null);

            if (participant == null) {
                participant = GatheringParticipant.builder()
                        .gathering(g)
                        .user(user)
                        .status(status)
                        .showPlate(_req.showPlate())
                        .showCarInfo(_req.showCarInfo())
                        .build();
            } else {
                participant.updateStatus(status);
                participant.updateVisibility(_req.showPlate(), _req.showCarInfo());
            }
            m_ParticipantRepository.save(participant);
            return getDetail(_gatheringId, user.getId());
        } catch (CustomException e) {
            throw e;
        } catch (Exception e) {
            throw new CustomException(ErrorCode.INTERNAL_SERVER_ERROR);
        }
    }

    // ==================== 찜하기 ====================

    @Transactional
    public boolean toggleBookmark(String _email, Long _gatheringId) {
        try {
            User user = getUser(_email);
            Gathering g = m_GatheringRepository.findById(_gatheringId)
                    .orElseThrow(() -> new CustomException(ErrorCode.INVALID_INPUT));

            return m_BookmarkRepository.findByGatheringIdAndUserId(_gatheringId, user.getId())
                    .map(b -> {
                        m_BookmarkRepository.delete(b);
                        return false;
                    })
                    .orElseGet(() -> {
                        m_BookmarkRepository.save(GatheringBookmark.builder()
                                .gathering(g).user(user).build());
                        return true;
                    });
        } catch (CustomException e) {
            throw e;
        } catch (Exception e) {
            throw new CustomException(ErrorCode.INTERNAL_SERVER_ERROR);
        }
    }

    // ==================== 댓글 ====================

    @Transactional
    public GatheringCommentResponse addComment(String _email, Long _gatheringId, GatheringCommentRequest _req) {
        try {
            User user = getUser(_email);
            Gathering g = m_GatheringRepository.findById(_gatheringId)
                    .orElseThrow(() -> new CustomException(ErrorCode.INVALID_INPUT));
            GatheringComment comment = GatheringComment.builder()
                    .gathering(g).user(user).content(_req.content()).build();
            return GatheringCommentResponse.from(m_CommentRepository.save(comment));
        } catch (CustomException e) {
            throw e;
        } catch (Exception e) {
            throw new CustomException(ErrorCode.INTERNAL_SERVER_ERROR);
        }
    }

    @Transactional
    public void deleteComment(String _email, Long _commentId) {
        try {
            User user = getUser(_email);
            GatheringComment comment = m_CommentRepository.findById(_commentId)
                    .orElseThrow(() -> new CustomException(ErrorCode.INVALID_INPUT));
            if (!comment.getUser().getId().equals(user.getId())) {
                throw new CustomException(ErrorCode.FORBIDDEN);
            }
            m_CommentRepository.delete(comment);
        } catch (CustomException e) {
            throw e;
        } catch (Exception e) {
            throw new CustomException(ErrorCode.INTERNAL_SERVER_ERROR);
        }
    }

    // ==================== 매너 온도 ====================

    @Transactional
    public void rateUser(String _email, Long _gatheringId, MannerRatingRequest _req) {
        try {
            User rater = getUser(_email);
            Gathering g = m_GatheringRepository.findById(_gatheringId)
                    .orElseThrow(() -> new CustomException(ErrorCode.INVALID_INPUT));

            if (g.getStatus() != Gathering.GatheringStatus.CLOSED) {
                throw new CustomException(ErrorCode.INVALID_INPUT);
            }
            if (_req.score() != 1 && _req.score() != -1) {
                throw new CustomException(ErrorCode.INVALID_INPUT);
            }
            if (rater.getId().equals(_req.ratedUserId())) {
                throw new CustomException(ErrorCode.INVALID_INPUT);
            }
            if (m_MannerRatingRepository.existsByGatheringIdAndRaterIdAndRatedId(
                    _gatheringId, rater.getId(), _req.ratedUserId())) {
                throw new CustomException(ErrorCode.INVALID_INPUT);
            }

            User rated = m_UserRepository.findById(_req.ratedUserId())
                    .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));

            m_MannerRatingRepository.save(MannerRating.builder()
                    .gathering(g).rater(rater).rated(rated).score(_req.score()).build());

            rated.updateMannerTemperature(_req.score() * 0.1);
            m_UserRepository.save(rated);
        } catch (CustomException e) {
            throw e;
        } catch (Exception e) {
            throw new CustomException(ErrorCode.INTERNAL_SERVER_ERROR);
        }
    }

    // ==================== 히스토리 ====================

    @Transactional(readOnly = true)
    public List<GatheringSummaryResponse> getMyHistory(String _email) {
        try {
            User user = getUser(_email);
            return m_GatheringRepository.findParticipatedByUserId(user.getId())
                    .stream()
                    .map(g -> {
                        int joinCount = m_ParticipantRepository.countByGatheringIdAndStatus(
                                g.getId(), GatheringParticipant.ParticipantStatus.JOIN);
                        boolean isBookmarked = m_BookmarkRepository.existsByGatheringIdAndUserId(g.getId(), user.getId());
                        return GatheringSummaryResponse.from(g, joinCount, isBookmarked);
                    })
                    .toList();
        } catch (CustomException e) {
            throw e;
        } catch (Exception e) {
            throw new CustomException(ErrorCode.INTERNAL_SERVER_ERROR);
        }
    }

    @Transactional(readOnly = true)
    public List<GatheringSummaryResponse> getMyBookmarks(String _email) {
        try {
            User user = getUser(_email);
            return m_GatheringRepository.findBookmarkedByUserId(user.getId())
                    .stream()
                    .map(g -> {
                        int joinCount = m_ParticipantRepository.countByGatheringIdAndStatus(
                                g.getId(), GatheringParticipant.ParticipantStatus.JOIN);
                        return GatheringSummaryResponse.from(g, joinCount, true);
                    })
                    .toList();
        } catch (CustomException e) {
            throw e;
        } catch (Exception e) {
            throw new CustomException(ErrorCode.INTERNAL_SERVER_ERROR);
        }
    }

    // ==================== 유틸 ====================

    private User getUser(String _email) {
        return m_UserRepository.findByEmail(_email)
                .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));
    }
}
