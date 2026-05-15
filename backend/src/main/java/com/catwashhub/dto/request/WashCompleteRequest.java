package com.catwashhub.dto.request;

import com.catwashhub.domain.WashSession;

import java.util.List;

// 후기 작성 완료 (DONE으로 전환)
public record WashCompleteRequest(
        WashSession.Weather weather,
        Integer durationMinutes,
        Integer cost,
        Integer rating,
        String memo,
        Long recipeId,
        List<WashSessionRequest.WashProductRequest> products  // 세차 중 용품 수정분 반영
) { }
