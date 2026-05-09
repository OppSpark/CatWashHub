package com.catwashhub.dto.response;

import java.time.LocalDate;
import java.util.List;

public record WashDashboardResponse(
        long totalCount,
        LocalDate lastWashedAt,
        Double avgCost,
        Double avgRating,
        List<WashSessionSummary> preparingSessions,
        List<WashSessionSummary> recentSessions,
        List<ProductSetSummary> favoriteSets
) {
    public record WashSessionSummary(
            Long id,
            String status,
            LocalDate washedAt,
            String location,
            Integer rating,
            Integer cost,
            int productCount
    ) { }

    public record ProductSetSummary(
            Long id,
            String name,
            Boolean isDefault,
            int itemCount
    ) { }
}
