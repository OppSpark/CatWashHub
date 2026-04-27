package com.catwashhub.dto.request;

import jakarta.validation.constraints.NotBlank;

import java.math.BigDecimal;

public record ProductRequest(

        Long categoryId,

        @NotBlank(message = "제품명을 입력해주세요.")
        String name,

        String brand,
        String description,
        Integer price,
        BigDecimal capacityMl,
        String visibility
) {}
