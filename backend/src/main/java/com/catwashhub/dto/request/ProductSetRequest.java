package com.catwashhub.dto.request;

import java.util.List;

public record ProductSetRequest(
        String name,
        Boolean isDefault,
        List<ProductSetItemRequest> items
) {
    public record ProductSetItemRequest(
            Long productId,
            String customName,
            String category,
            Integer sortOrder
    ) { }
}
