package com.catwashhub.dto.response;

import java.util.List;

public record SummaryStatsResponse(
        Long totalCost,
        Long thisMonthCost,
        Long lastMonthCost,
        List<TopProduct> topProducts
) {
    public record TopProduct(String name, long count) { }
}
