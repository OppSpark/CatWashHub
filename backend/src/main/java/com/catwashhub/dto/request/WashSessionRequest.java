package com.catwashhub.dto.request;

import java.time.LocalDate;
import java.util.List;

// 세차 준비 저장 (1차 저장 - PREPARING)
public record WashSessionRequest(
        LocalDate washedAt,
        String location,
        Long recipeId,
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
