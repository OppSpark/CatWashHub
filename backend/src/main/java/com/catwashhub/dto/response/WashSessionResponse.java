package com.catwashhub.dto.response;

import com.catwashhub.domain.WashPhoto;
import com.catwashhub.domain.WashProduct;
import com.catwashhub.domain.WashSession;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

public record WashSessionResponse(
        Long id,
        LocalDate washedAt,
        String location,
        String weather,
        Integer durationMinutes,
        Integer cost,
        Integer rating,
        String memo,
        List<WashPhotoResponse> photos,
        List<WashProductResponse> products,
        LocalDateTime createdAt
) {
    public record WashPhotoResponse(
            Long id,
            String photoUrl,
            String photoType
    ) { }

    public record WashProductResponse(
            Long id,
            Long productId,
            String productName,
            String category,
            String memo,
            Integer sortOrder
    ) { }

    public static WashSessionResponse from(WashSession session) {
        List<WashPhotoResponse> photos = session.getPhotos().stream()
                .map(p -> new WashPhotoResponse(p.getId(), p.getPhotoUrl(), p.getPhotoType().name()))
                .toList();

        List<WashProductResponse> products = session.getWashProducts().stream()
                .map(wp -> new WashProductResponse(
                        wp.getId(),
                        wp.getProduct() != null ? wp.getProduct().getId() : null,
                        wp.getDisplayName(),
                        wp.getCategory(),
                        wp.getMemo(),
                        wp.getSortOrder()
                ))
                .toList();

        return new WashSessionResponse(
                session.getId(),
                session.getWashedAt(),
                session.getLocation(),
                session.getWeather() != null ? session.getWeather().name() : null,
                session.getDurationMinutes(),
                session.getCost(),
                session.getRating(),
                session.getMemo(),
                photos,
                products,
                session.getCreatedAt()
        );
    }
}
