package com.catwashhub.dto.request;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.math.BigDecimal;

public record CalculationRequest(

        Long productId,

        @NotNull(message = "희석비를 입력해주세요.")
        @Positive(message = "희석비는 양수여야 합니다.")
        Integer ratio,

        @NotNull(message = "물 양을 입력해주세요.")
        @Positive(message = "물 양은 양수여야 합니다.")
        BigDecimal waterMl,

        String memo
) {}
