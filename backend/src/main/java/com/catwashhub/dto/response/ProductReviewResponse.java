package com.catwashhub.dto.response;

import com.catwashhub.domain.ProductReview;

import java.time.LocalDateTime;

public record ProductReviewResponse(
        Long id,
        Long userId,
        String nickname,
        Integer rating,
        String content,
        LocalDateTime createdAt
) {
    public static ProductReviewResponse from(ProductReview r) {
        return new ProductReviewResponse(
                r.getId(),
                r.getUser().getId(),
                r.getUser().getNickname(),
                r.getRating(),
                r.getContent(),
                r.getCreatedAt()
        );
    }
}
