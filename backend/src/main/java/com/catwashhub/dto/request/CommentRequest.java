package com.catwashhub.dto.request;

public record CommentRequest(
        Long parentId,
        String content
) { }
