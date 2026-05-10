package com.catwashhub.repository;

import com.catwashhub.domain.WashSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface WashSessionRepository extends JpaRepository<WashSession, Long> {

    List<WashSession> findByUserIdOrderByWashedAtDesc(Long userId);

    // 상태별 조회
    List<WashSession> findByUserIdAndStatusOrderByCreatedAtDesc(
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
               AVG(CASE WHEN w.rating IS NOT NULL THEN w.rating END) as avgRating
        FROM WashSession w
        WHERE w.user.id = :userId
          AND w.status = 'DONE'
          AND w.washedAt >= :from
        GROUP BY FUNCTION('DATE_FORMAT', w.washedAt, '%Y-%m')
        ORDER BY month ASC
        """)
    List<Object[]> findMonthlyStats(@Param("userId") Long userId, @Param("from") java.time.LocalDate from);
}
