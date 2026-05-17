package com.catwashhub.repository;

import com.catwashhub.domain.GatheringParticipant;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface GatheringParticipantRepository extends JpaRepository<GatheringParticipant, Long> {
    List<GatheringParticipant> findByGatheringId(Long gatheringId);
    Optional<GatheringParticipant> findByGatheringIdAndUserId(Long gatheringId, Long userId);
    boolean existsByGatheringIdAndUserId(Long gatheringId, Long userId);
    int countByGatheringIdAndStatus(Long gatheringId, GatheringParticipant.ParticipantStatus status);
}
