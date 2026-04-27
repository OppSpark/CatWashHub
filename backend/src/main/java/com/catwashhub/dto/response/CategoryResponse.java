package com.catwashhub.dto.response;

import com.catwashhub.domain.Category;

public record CategoryResponse(Long id, String name, Integer sortOrder) {

    public static CategoryResponse from(Category category) {
        return new CategoryResponse(category.getId(), category.getName(), category.getSortOrder());
    }
}
