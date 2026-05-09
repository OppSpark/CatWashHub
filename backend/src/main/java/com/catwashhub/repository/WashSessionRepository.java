package com.catwashhub.repository;

import com.catwashhub.domain.WashSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface WashSessionRepository extends JpaRepository<WashSession, Long> {

    List<WashSession> findByUserIdOrderByWashedAtDesc(Long userId);

    Optional<WashSession> findByIdAndUserId(Long id, Long userId);

    // 홈 대시보드용: 최근 N건
    @Query("SELECT w FROM WashSession w WHERE w.user.id = :userId ORDER BY w.washedAt DESC LIMIT :limit")
    List<WashSession> findRecentByUserId(@Param("userId") Long userId, @Param("limit") int limit);

    long countByUserId(Long userId);
}
