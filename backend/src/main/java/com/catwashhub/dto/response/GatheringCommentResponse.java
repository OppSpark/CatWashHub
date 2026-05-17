package com.catwashhub.dto.response;

import com.catwashhub.domain.GatheringComment;

import java.time.LocalDateTime;

public record GatheringCommentResponse(
        Long id,
        Long userId,
        String nickname,
        String content,
        LocalDateTime createdAt
) {
    public static GatheringCommentResponse from(GatheringComment comment) {
        return new GatheringCommentResponse(
                comment.getId(),
                comment.getUser().getId(),
                comment.getUser().getNickname(),
                comment.getContent(),
                comment.getCreatedAt()
        );
    }
}
