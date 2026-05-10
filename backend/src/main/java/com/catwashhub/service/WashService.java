package com.catwashhub.service;

import com.catwashhub.domain.*;
import com.catwashhub.dto.request.WashCompleteRequest;
import com.catwashhub.dto.request.WashSessionRequest;
import com.catwashhub.dto.request.WashUpdateRequest;
import com.catwashhub.dto.response.MonthlyStatsResponse;
import com.catwashhub.dto.response.WashDashboardResponse;
import com.catwashhub.dto.response.WashSessionResponse;
import com.catwashhub.exception.CustomException;
import com.catwashhub.exception.ErrorCode;
import com.catwashhub.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.time.format.DateTimeParseException;

@Service
@RequiredArgsConstructor
public class WashService {

    private static final int c_DashboardRecentCount = 5;

    private final WashSessionRepository m_WashSessionRepository;
    private final ProductRepository m_ProductRepository;
    private final ProductSetRepository m_ProductSetRepository;
    private final UserRepository m_UserRepository;
    private final RecipeRepository m_RecipeRepository;

    // ==================== 대시보드 ====================

    @Transactional(readOnly = true)
    public WashDashboardResponse getDashboard(String _email) {
        User user = getUser(_email);

        long totalCount = m_WashSessionRepository.countByUserIdAndStatus(
                user.getId(), WashSession.Status.DONE);

        Double avgCost = m_WashSessionRepository.avgCostByUserId(user.getId());
        Double avgRating = m_WashSessionRepository.avgRatingByUserId(user.getId());

        List<WashSession> recentDone = m_WashSessionRepository
                .findRecentDoneByUserId(user.getId(), c_DashboardRecentCount);

        LocalDate lastWashedAt = recentDone.isEmpty() ? null : recentDone.get(0).getWashedAt();

        List<WashDashboardResponse.WashSessionSummary> preparingSummaries =
                m_WashSessionRepository.findByUserIdAndStatusOrderByCreatedAtDesc(
                                user.getId(), WashSession.Status.PREPARING)
                        .stream()
                        .map(this::toSummary)
                        .toList();

        List<WashDashboardResponse.WashSessionSummary> doneSummaries = recentDone.stream()
                .map(this::toSummary)
                .toList();

        List<WashDashboardResponse.ProductSetSummary> setSummaries = m_ProductSetRepository
                .findByUserIdOrderByIsDefaultDescCreatedAtAsc(user.getId())
                .stream()
                .map(set -> new WashDashboardResponse.ProductSetSummary(
                        set.getId(), set.getName(), set.getIsDefault(), set.getItems().size()
                ))
                .toList();

        return new WashDashboardResponse(
                totalCount, lastWashedAt, avgCost, avgRating,
                preparingSummaries, doneSummaries, setSummaries);
    }

    // ==================== 세차 준비 저장 (PREPARING) ====================

    @Transactional
    public WashSessionResponse createSession(String _email, WashSessionRequest _request) {
        User user = getUser(_email);

        Recipe recipe = null;
        if (_request.recipeId() != null) {
            recipe = m_RecipeRepository.findById(_request.recipeId()).orElse(null);
        }

        WashSession session = WashSession.builder()
                .user(user)
                .washedAt(_request.washedAt() != null ? _request.washedAt() : LocalDate.now())
                .location(_request.location())
                .recipe(recipe)
                .build();

        addProducts(session, _request.products());
        m_WashSessionRepository.save(session);

        return WashSessionResponse.from(session);
    }

    // ==================== 세차 준비 수정 (장소/금액/용품) ====================

    @Transactional
    public WashSessionResponse updatePreparation(String _email, Long _sessionId,
                                                  WashSessionRequest _request) {
        User user = getUser(_email);
        WashSession session = getSessionOfUser(_sessionId, user.getId());

        session.updatePreparation(_request.location(), null);
        session.getWashProducts().clear();
        addProducts(session, _request.products());

        return WashSessionResponse.from(session);
    }

    // ==================== 완료된 세차 수정 (DONE) ====================

    @Transactional
    public WashSessionResponse updateDone(String _email, Long _sessionId, WashUpdateRequest _request) {
        User user = getUser(_email);
        WashSession session = getSessionOfUser(_sessionId, user.getId());

        LocalDate washedAt = null;
        try {
            if (_request.washedAt() != null && !_request.washedAt().isBlank()) {
                washedAt = LocalDate.parse(_request.washedAt());
            }
        } catch (DateTimeParseException ignored) { }

        session.updateDone(
                washedAt,
                _request.location(),
                _request.weather(),
                _request.durationMinutes(),
                _request.cost(),
                _request.rating(),
                _request.memo()
        );

        return WashSessionResponse.from(session);
    }

    // ==================== 후기 작성 완료 (DONE) ====================

    @Transactional
    public WashSessionResponse completeSession(String _email, Long _sessionId,
                                               WashCompleteRequest _request) {
        User user = getUser(_email);
        WashSession session = getSessionOfUser(_sessionId, user.getId());

        // 용품 수정분 반영
        if (_request.products() != null) {
            session.getWashProducts().clear();
            addProducts(session, _request.products());
        }

        session.complete(
                _request.weather(),
                _request.durationMinutes(),
                _request.cost(),
                _request.rating(),
                _request.memo()
        );

        return WashSessionResponse.from(session);
    }

    // ==================== 조회 ====================

    @Transactional(readOnly = true)
    public List<WashSessionResponse> getSessions(String _email) {
        User user = getUser(_email);
        return m_WashSessionRepository.findByUserIdOrderByWashedAtDesc(user.getId())
                .stream()
                .map(WashSessionResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public WashSessionResponse getSession(String _email, Long _sessionId) {
        User user = getUser(_email);
        WashSession session = getSessionOfUser(_sessionId, user.getId());
        return WashSessionResponse.from(session);
    }

    // ==================== 삭제 ====================

    @Transactional
    public void deleteSession(String _email, Long _sessionId) {
        User user = getUser(_email);
        WashSession session = getSessionOfUser(_sessionId, user.getId());
        m_WashSessionRepository.delete(session);
    }

    // ==================== 월별 통계 ====================

    @Transactional(readOnly = true)
    public MonthlyStatsResponse getMonthlyStats(String _email) {
        User user = getUser(_email);
        LocalDate from = LocalDate.now().minusMonths(11).withDayOfMonth(1);

        List<Object[]> rows = m_WashSessionRepository.findMonthlyStats(user.getId(), from);
        List<MonthlyStatsResponse.MonthlyData> monthly = new ArrayList<>();
        for (Object[] row : rows) {
            monthly.add(new MonthlyStatsResponse.MonthlyData(
                    (String) row[0],
                    ((Number) row[1]).longValue(),
                    row[2] != null ? ((Number) row[2]).doubleValue() : null,
                    row[3] != null ? ((Number) row[3]).doubleValue() : null
            ));
        }
        return new MonthlyStatsResponse(monthly);
    }

    // ==================== 초기화 함수 ====================

    private void addProducts(WashSession _session,
                             List<WashSessionRequest.WashProductRequest> _products) {
        if (_products == null) {
            return;
        }

        for (WashSessionRequest.WashProductRequest req : _products) {
            Product product = null;
            if (req.productId() != null) {
                product = m_ProductRepository.findById(req.productId())
                        .orElseThrow(() -> new CustomException(ErrorCode.PRODUCT_NOT_FOUND));
            }

            WashProduct washProduct = WashProduct.builder()
                    .washSession(_session)
                    .product(product)
                    .customName(req.customName())
                    .category(req.category())
                    .memo(req.memo())
                    .sortOrder(req.sortOrder())
                    .build();

            _session.getWashProducts().add(washProduct);
        }
    }

    private WashDashboardResponse.WashSessionSummary toSummary(WashSession _session) {
        return new WashDashboardResponse.WashSessionSummary(
                _session.getId(),
                _session.getStatus().name(),
                _session.getWashedAt(),
                _session.getLocation(),
                _session.getRating(),
                _session.getCost(),
                _session.getWashProducts().size()
        );
    }

    private WashSession getSessionOfUser(Long _sessionId, Long _userId) {
        return m_WashSessionRepository.findByIdAndUserId(_sessionId, _userId)
                .orElseThrow(() -> new CustomException(ErrorCode.WASH_SESSION_NOT_FOUND));
    }

    private User getUser(String _email) {
        return m_UserRepository.findByEmail(_email)
                .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));
    }
}
