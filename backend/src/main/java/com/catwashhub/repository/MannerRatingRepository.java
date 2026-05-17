package com.catwashhub.repository;

import com.catwashhub.domain.MannerRating;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MannerRatingRepository extends JpaRepository<MannerRating, Long> {
    boolean existsByGatheringIdAndRaterIdAndRatedId(Long gatheringId, Long raterId, Long ratedId);
}
