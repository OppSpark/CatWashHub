package com.catwashhub.dto.request;

public record PostRequest(
        String postType,
        Long washSessionId,
        String title,
        String content
) { }
