package com.catwashhub.dto.response;

import com.catwashhub.domain.Product;

import java.math.BigDecimal;
import java.util.List;

public record ProductResponse(
        Long id,
        String categoryName,
        String name,
        String brand,
        String description,
        Integer price,
        BigDecimal capacityMl,
        String imageUrl,
        String visibility,
        List<DilutionRatioResponse> dilutionRatios
) {
    public static ProductResponse from(Product product) {
        return new ProductResponse(
                product.getId(),
                product.getCategory() != null ? product.getCategory().getName() : null,
                product.getName(),
                product.getBrand(),
                product.getDescription(),
                product.getPrice(),
                product.getCapacityMl(),
                product.getImageUrl(),
                product.getVisibility().name(),
                product.getDilutionRatios().stream()
                        .map(DilutionRatioResponse::from)
                        .toList()
        );
    }
}
