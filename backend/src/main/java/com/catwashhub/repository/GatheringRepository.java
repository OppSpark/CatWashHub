package com.catwashhub.repository;

import com.catwashhub.domain.Gathering;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface GatheringRepository extends JpaRepository<Gathering, Long> {

    Page<Gathering> findAllByOrderByCreatedAtDesc(Pageable pageable);

    List<Gathering> findByHostIdOrderByCreatedAtDesc(Long hostId);

    @Query("SELECT g FROM Gathering g JOIN GatheringParticipant p ON p.gathering = g WHERE p.user.id = :userId ORDER BY g.gatheringAt DESC")
    List<Gathering> findParticipatedByUserId(@Param("userId") Long userId);

    @Query("SELECT g FROM Gathering g JOIN GatheringBookmark b ON b.gathering = g WHERE b.user.id = :userId ORDER BY b.createdAt DESC")
    List<Gathering> findBookmarkedByUserId(@Param("userId") Long userId);
}
