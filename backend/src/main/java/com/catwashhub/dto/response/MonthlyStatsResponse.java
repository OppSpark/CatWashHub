package com.catwashhub.dto.response;

import java.util.List;

public record MonthlyStatsResponse(
        List<MonthlyData> monthly
) {
    public record MonthlyData(
            String month,   // "2026-01"
            long count,
            Double avgCost,
            Double avgRating
    ) { }
}
