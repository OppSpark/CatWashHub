package com.catwashhub.dto.response;

import com.catwashhub.domain.ProductSet;
import com.catwashhub.domain.ProductSetItem;

import java.util.List;

public record ProductSetResponse(
        Long id,
        String name,
        Boolean isDefault,
        List<ProductSetItemResponse> items
) {
    public record ProductSetItemResponse(
            Long id,
            Long productId,
            String productName,
            String category,
            Integer sortOrder
    ) { }

    public static ProductSetResponse from(ProductSet set) {
        List<ProductSetItemResponse> items = set.getItems().stream()
                .map(item -> new ProductSetItemResponse(
                        item.getId(),
                        item.getProduct() != null ? item.getProduct().getId() : null,
                        item.getDisplayName(),
                        item.getCategory(),
                        item.getSortOrder()
                ))
                .toList();

        return new ProductSetResponse(set.getId(), set.getName(), set.getIsDefault(), items);
    }
}
