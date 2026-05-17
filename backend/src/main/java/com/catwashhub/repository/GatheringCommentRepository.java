package com.catwashhub.repository;

import com.catwashhub.domain.GatheringComment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface GatheringCommentRepository extends JpaRepository<GatheringComment, Long> {
    List<GatheringComment> findByGatheringIdOrderByCreatedAtAsc(Long gatheringId);
}
