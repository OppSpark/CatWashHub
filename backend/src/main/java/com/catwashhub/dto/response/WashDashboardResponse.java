package com.catwashhub.dto.response;

import java.time.LocalDate;
import java.util.List;

public record WashDashboardResponse(
        long totalCount,
        LocalDate lastWashedAt,
        List<WashSessionSummary> preparingSessions,  // 진행 중 (PREPARING)
        List<WashSessionSummary> recentSessions,     // 최근 완료 (DONE)
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
