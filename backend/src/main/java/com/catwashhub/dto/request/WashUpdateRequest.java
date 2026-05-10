package com.catwashhub.dto.request;

import com.catwashhub.domain.WashSession;

public record WashUpdateRequest(
        String location,
        WashSession.Weather weather,
        Integer durationMinutes,
        Integer cost,
        Integer rating,
        String memo
) { }
