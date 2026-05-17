package com.catwashhub.repository;

import com.catwashhub.domain.WashSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface WashSessionRepository extends JpaRepository<WashSession, Long> {

    List<WashSession> findByUserIdOrderByWashedAtDesc(Long userId);

    // 상태별 조회 (생성일순)
    List<WashSession> findByUserIdAndStatusOrderByCreatedAtDesc(
            Long userId, WashSession.Status status);

    // 상태별 조회 (세차일순) — 게시글 작성 시 세차기록 선택용
    List<WashSession> findByUserIdAndStatusOrderByWashedAtDesc(
            Long userId, WashSession.Status status);

    Optional<WashSession> findByIdAndUserId(Long id, Long userId);

    // 홈 대시보드용: DONE 최근 N건
    @Query("SELECT w FROM WashSession w WHERE w.user.id = :userId AND w.status = 'DONE' ORDER BY w.washedAt DESC LIMIT :limit")
    List<WashSession> findRecentDoneByUserId(@Param("userId") Long userId, @Param("limit") int limit);

    // DONE 상태만 카운트
    long countByUserIdAndStatus(Long userId, WashSession.Status status);

    // 평균 비용 / 평균 별점 (DONE, null 제외)
    @Query("SELECT AVG(w.cost) FROM WashSession w WHERE w.user.id = :userId AND w.status = 'DONE' AND w.cost IS NOT NULL")
    Double avgCostByUserId(@Param("userId") Long userId);

    @Query("SELECT AVG(w.rating) FROM WashSession w WHERE w.user.id = :userId AND w.status = 'DONE' AND w.rating IS NOT NULL")
    Double avgRatingByUserId(@Param("userId") Long userId);

    // 월별 통계 (최근 12개월)
    @Query("""
        SELECT FUNCTION('DATE_FORMAT', w.washedAt, '%Y-%m') as month,
               COUNT(w) as cnt,
               AVG(CASE WHEN w.cost IS NOT NULL THEN w.cost END) as avgCost,
               AVG(CASE WHEN w.rating IS NOT NULL THEN w.rating END) as avgRating,
               SUM(CASE WHEN w.cost IS NOT NULL THEN w.cost ELSE 0 END) as totalCost
        FROM WashSession w
        WHERE w.user.id = :userId
          AND w.status = 'DONE'
          AND w.washedAt >= :from
        GROUP BY FUNCTION('DATE_FORMAT', w.washedAt, '%Y-%m')
        ORDER BY month ASC
        """)
    List<Object[]> findMonthlyStats(@Param("userId") Long userId, @Param("from") java.time.LocalDate from);

    // 누적 총 비용
    @Query("SELECT COALESCE(SUM(w.cost), 0) FROM WashSession w WHERE w.user.id = :userId AND w.status = 'DONE' AND w.cost IS NOT NULL")
    Long sumCostByUserId(@Param("userId") Long userId);

    // 이번 달 총 비용
    @Query("""
        SELECT COALESCE(SUM(w.cost), 0) FROM WashSession w
        WHERE w.user.id = :userId AND w.status = 'DONE' AND w.cost IS NOT NULL
          AND FUNCTION('DATE_FORMAT', w.washedAt, '%Y-%m') = :month
        """)
    Long sumCostByUserIdAndMonth(@Param("userId") Long userId, @Param("month") String month);

    // 자주 쓴 용품 TOP 5
    @Query("""
        SELECT COALESCE(wp.product.name, wp.customName) as name, COUNT(wp) as cnt
        FROM WashProduct wp
        WHERE wp.washSession.user.id = :userId
          AND wp.washSession.status = 'DONE'
          AND COALESCE(wp.product.name, wp.customName) IS NOT NULL
        GROUP BY COALESCE(wp.product.name, wp.customName)
        ORDER BY cnt DESC
        LIMIT 5
        """)
    List<Object[]> findTopProducts(@Param("userId") Long userId);
}
