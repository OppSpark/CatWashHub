package com.catwashhub.dto.response;

import com.catwashhub.domain.Gathering;

import java.time.LocalDateTime;

public record GatheringSummaryResponse(
        Long id,
        String title,
        String location,
        LocalDateTime gatheringAt,
        String status,
        String hostNickname,
        int joinCount,
        Integer maxParticipants,
        boolean isBookmarked,
        LocalDateTime createdAt
) {
    public static GatheringSummaryResponse from(Gathering g, int joinCount, boolean isBookmarked) {
        return new GatheringSummaryResponse(
                g.getId(),
                g.getTitle(),
                g.getLocation(),
                g.getGatheringAt(),
                g.getStatus().name(),
                g.getHost().getNickname(),
                joinCount,
                g.getMaxParticipants(),
                isBookmarked,
                g.getCreatedAt()
        );
    }
}
