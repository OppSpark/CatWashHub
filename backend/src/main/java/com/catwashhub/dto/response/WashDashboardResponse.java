package com.catwashhub.dto.response;

import java.time.LocalDate;
import java.util.List;

public record WashDashboardResponse(
        long totalCount,
        LocalDate lastWashedAt,
        List<WashSessionSummary> recentSessions,
        List<ProductSetSummary> favoriteSets
) {
    public record WashSessionSummary(
            Long id,
            LocalDate washedAt,
            String location,
            Integer rating,
            Integer cost
    ) { }

    public record ProductSetSummary(
            Long id,
            String name,
            Boolean isDefault,
            int itemCount
    ) { }
}
