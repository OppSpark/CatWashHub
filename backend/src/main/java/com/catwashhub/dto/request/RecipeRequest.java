package com.catwashhub.dto.request;

import com.catwashhub.domain.RecipeStep;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;

import java.util.List;

public record RecipeRequest(

        @NotBlank(message = "레시피 제목을 입력해주세요.")
        String title,

        String description,
        String carModel,
        Integer estimatedMinutes,
        String visibility,

        @NotEmpty(message = "최소 1개 이상의 단계를 추가해주세요.")
        List<RecipeStepRequest> steps
) {
    public record RecipeStepRequest(
            Integer stepOrder,
            RecipeStep.StepType stepType,
            String customLabel,
            Long productId,
            Integer ratio,
            String memo
    ) {}
}
