package com.catwashhub.dto.response;

import com.catwashhub.domain.ProductReview;

import java.time.LocalDateTime;

public record MyProductReviewResponse(
        Long id,
        Long productId,
        String productName,
        String productBrand,
        Integer rating,
        String content,
        LocalDateTime createdAt
) {
    public static MyProductReviewResponse from(ProductReview r) {
        return new MyProductReviewResponse(
                r.getId(),
                r.getProduct().getId(),
                r.getProduct().getName(),
                r.getProduct().getBrand(),
                r.getRating(),
                r.getContent(),
                r.getCreatedAt()
        );
    }
}
