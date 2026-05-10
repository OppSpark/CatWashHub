package com.catwashhub.dto.response;

import com.catwashhub.domain.Comment;
import com.catwashhub.domain.Post;

import java.time.LocalDateTime;
import java.util.List;

public record PostResponse(
        Long id,
        Long authorId,
        String authorNickname,
        String title,
        String content,
        int viewCount,
        long likeCount,
        boolean likedByMe,
        int commentCount,
        List<String> imageUrls,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
    public record PostSummary(
            Long id,
            Long authorId,
            String authorNickname,
            String title,
            int viewCount,
            long likeCount,
            int commentCount,
            LocalDateTime createdAt
    ) {
        public static PostSummary from(Post post) {
            return new PostSummary(
                    post.getId(),
                    post.getUser().getId(),
                    post.getUser().getNickname(),
                    post.getTitle(),
                    post.getViewCount(),
                    post.getLikes().size(),
                    post.getComments().size(),
                    post.getCreatedAt()
            );
        }
    }

    public static PostResponse from(Post post, boolean likedByMe) {
        List<String> imageUrls = post.getImages().stream()
                .map(img -> img.getImageUrl())
                .toList();

        return new PostResponse(
                post.getId(),
                post.getUser().getId(),
                post.getUser().getNickname(),
                post.getTitle(),
                post.getContent(),
                post.getViewCount(),
                post.getLikes().size(),
                likedByMe,
                (int) post.getComments().stream().filter(c -> c.getParent() == null).count()
                        + post.getComments().stream().mapToInt(c -> c.getReplies().size()).sum(),
                imageUrls,
                post.getCreatedAt(),
                post.getUpdatedAt()
        );
    }
}
