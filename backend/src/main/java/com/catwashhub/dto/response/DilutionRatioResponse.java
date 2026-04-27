package com.catwashhub.dto.response;

import com.catwashhub.domain.DilutionRatio;

public record DilutionRatioResponse(Long id, String label, Integer ratio, String description) {

    public static DilutionRatioResponse from(DilutionRatio dilutionRatio) {
        return new DilutionRatioResponse(
                dilutionRatio.getId(),
                dilutionRatio.getLabel(),
                dilutionRatio.getRatio(),
                dilutionRatio.getDescription()
        );
    }
}
