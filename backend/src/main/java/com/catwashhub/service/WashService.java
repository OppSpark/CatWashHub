package com.catwashhub.service;

import com.catwashhub.domain.*;
import com.catwashhub.dto.request.WashSessionRequest;
import com.catwashhub.dto.response.WashDashboardResponse;
import com.catwashhub.dto.response.WashSessionResponse;
import com.catwashhub.exception.CustomException;
import com.catwashhub.exception.ErrorCode;
import com.catwashhub.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class WashService {

    private static final int c_DashboardRecentCount = 5;

    private final WashSessionRepository m_WashSessionRepository;
    private final ProductRepository m_ProductRepository;
    private final ProductSetRepository m_ProductSetRepository;
    private final UserRepository m_UserRepository;

    // ==================== 대시보드 ====================

    @Transactional(readOnly = true)
    public WashDashboardResponse getDashboard(String _email) {
        User user = getUser(_email);

        long totalCount = m_WashSessionRepository.countByUserId(user.getId());

        List<WashSession> recentSessions = m_WashSessionRepository
                .findRecentByUserId(user.getId(), c_DashboardRecentCount);

        WashSession lastSession = recentSessions.isEmpty() ? null : recentSessions.get(0);

        List<WashDashboardResponse.WashSessionSummary> sessionSummaries = recentSessions.stream()
                .map(s -> new WashDashboardResponse.WashSessionSummary(
                        s.getId(), s.getWashedAt(), s.getLocation(), s.getRating(), s.getCost()
                ))
                .toList();

        List<WashDashboardResponse.ProductSetSummary> setSummaries = m_ProductSetRepository
                .findByUserIdOrderByIsDefaultDescCreatedAtAsc(user.getId())
                .stream()
                .map(set -> new WashDashboardResponse.ProductSetSummary(
                        set.getId(), set.getName(), set.getIsDefault(), set.getItems().size()
                ))
                .toList();

        return new WashDashboardResponse(
                totalCount,
                lastSession != null ? lastSession.getWashedAt() : null,
                sessionSummaries,
                setSummaries
        );
    }

    // ==================== 세차 일지 CRUD ====================

    @Transactional
    public WashSessionResponse createSession(String _email, WashSessionRequest _request) {
        User user = getUser(_email);

        WashSession session = WashSession.builder()
                .user(user)
                .washedAt(_request.washedAt())
                .location(_request.location())
                .weather(_request.weather())
                .durationMinutes(_request.durationMinutes())
                .cost(_request.cost())
                .rating(_request.rating())
                .memo(_request.memo())
                .build();

        addProducts(session, _request.products());
        m_WashSessionRepository.save(session);

        return WashSessionResponse.from(session);
    }

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
        WashSession session = m_WashSessionRepository.findByIdAndUserId(_sessionId, user.getId())
                .orElseThrow(() -> new CustomException(ErrorCode.WASH_SESSION_NOT_FOUND));
        return WashSessionResponse.from(session);
    }

    @Transactional
    public WashSessionResponse updateSession(String _email, Long _sessionId, WashSessionRequest _request) {
        User user = getUser(_email);
        WashSession session = m_WashSessionRepository.findByIdAndUserId(_sessionId, user.getId())
                .orElseThrow(() -> new CustomException(ErrorCode.WASH_SESSION_NOT_FOUND));

        session.update(
                _request.washedAt(), _request.location(), _request.weather(),
                _request.durationMinutes(), _request.cost(), _request.rating(), _request.memo()
        );

        session.getWashProducts().clear();
        addProducts(session, _request.products());

        return WashSessionResponse.from(session);
    }

    @Transactional
    public void deleteSession(String _email, Long _sessionId) {
        User user = getUser(_email);
        WashSession session = m_WashSessionRepository.findByIdAndUserId(_sessionId, user.getId())
                .orElseThrow(() -> new CustomException(ErrorCode.WASH_SESSION_NOT_FOUND));
        m_WashSessionRepository.delete(session);
    }

    // ==================== 초기화 함수 ====================

    private void addProducts(WashSession _session, List<WashSessionRequest.WashProductRequest> _products) {
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

    private User getUser(String _email) {
        return m_UserRepository.findByEmail(_email)
                .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));
    }
}
