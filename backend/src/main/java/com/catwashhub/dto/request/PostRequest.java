package com.catwashhub.dto.request;

import java.util.List;

public record PostRequest(
        String postType,
        Long washSessionId,
        String title,
        String content,
        List<String> imageUrls
) { }
