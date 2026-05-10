package com.catwashhub.dto.response;

import com.catwashhub.domain.Recipe;
import com.catwashhub.domain.RecipeStep;

import java.time.LocalDateTime;
import java.util.List;

public record RecipeResponse(
        Long id,
        String authorNickname,
        String title,
        String description,
        String carModel,
        Integer estimatedMinutes,
        String visibility,
        Integer saveCount,
        boolean isSaved,
        LocalDateTime createdAt,
        List<RecipeStepResponse> steps
) {
    public static RecipeResponse from(Recipe recipe, boolean isSaved) {
        return new RecipeResponse(
                recipe.getId(),
                recipe.getUser().getNickname(),
                recipe.getTitle(),
                recipe.getDescription(),
                recipe.getCarModel(),
                recipe.getEstimatedMinutes(),
                recipe.getVisibility().name(),
                recipe.getSaveCount(),
                isSaved,
                recipe.getCreatedAt(),
                recipe.getSteps().stream()
                        .map(RecipeStepResponse::from)
                        .toList()
        );
    }

    public record RecipeStepResponse(
            Long id,
            Integer stepOrder,
            String stepType,
            String stepTypeLabel,
            String displayLabel,
            Long productId,
            String productName,
            Integer ratio,
            String memo
    ) {
        public static RecipeStepResponse from(RecipeStep step) {
            return new RecipeStepResponse(
                    step.getId(),
                    step.getStepOrder(),
                    step.getStepType().name(),
                    step.getStepType().getLabel(),
                    step.getDisplayLabel(),
                    step.getProduct() != null ? step.getProduct().getId() : null,
                    step.getProduct() != null ? step.getProduct().getName() : null,
                    step.getRatio(),
                    step.getMemo()
            );
        }
    }
}
