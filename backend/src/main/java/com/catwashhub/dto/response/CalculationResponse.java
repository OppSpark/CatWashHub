package com.catwashhub.dto.response;

import java.math.BigDecimal;

public record CalculationResponse(
        Long productId,
        String productName,
        Integer ratio,
        BigDecimal waterMl,
        BigDecimal productMl
) {}
