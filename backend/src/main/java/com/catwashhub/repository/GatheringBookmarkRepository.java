package com.catwashhub.repository;

import com.catwashhub.domain.GatheringBookmark;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface GatheringBookmarkRepository extends JpaRepository<GatheringBookmark, Long> {
    Optional<GatheringBookmark> findByGatheringIdAndUserId(Long gatheringId, Long userId);
    boolean existsByGatheringIdAndUserId(Long gatheringId, Long userId);
}
