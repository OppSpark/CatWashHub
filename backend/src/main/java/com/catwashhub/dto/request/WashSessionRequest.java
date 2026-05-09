package com.catwashhub.dto.request;

import com.catwashhub.domain.WashSession;

import java.time.LocalDate;
import java.util.List;

public record WashSessionRequest(
        LocalDate washedAt,
        String location,
        WashSession.Weather weather,
        Integer durationMinutes,
        Integer cost,
        Integer rating,
        String memo,
        List<WashProductRequest> products
) {
    public record WashProductRequest(
            Long productId,
            String customName,
            String category,
            String memo,
            Integer sortOrder
    ) { }
}
