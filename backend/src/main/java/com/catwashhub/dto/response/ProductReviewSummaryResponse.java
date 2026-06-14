package com.catwashhub.dto.response;

import java.util.List;

public record ProductReviewSummaryResponse(
        Double avgRating,
        int totalCount,
        List<ProductReviewResponse> reviews
) {}
