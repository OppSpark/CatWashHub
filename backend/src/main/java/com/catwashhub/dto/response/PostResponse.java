package com.catwashhub.dto.response;

import com.catwashhub.domain.Post;
import com.catwashhub.domain.WashSession;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

public record PostResponse(
        Long id,
        Long authorId,
        String authorNickname,
        String postType,
        String title,
        String content,
        int viewCount,
        long likeCount,
        boolean likedByMe,
        int commentCount,
        List<String> imageUrls,
        WashSessionEmbed washSession,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
    // 세차일지 첨부 정보 (목록/상세 공통)
    public record WashSessionEmbed(
            Long id,
            LocalDate washedAt,
            String location,
            String weather,
            Integer durationMinutes,
            Integer cost,
            Integer rating,
            String memo,
            List<String> productNames
    ) {
        public static WashSessionEmbed from(WashSession session) {
            List<String> productNames = session.getWashProducts().stream()
                    .map(wp -> wp.getDisplayName())
                    .toList();
            return new WashSessionEmbed(
                    session.getId(),
                    session.getWashedAt(),
                    session.getLocation(),
                    session.getWeather() != null ? session.getWeather().name() : null,
                    session.getDurationMinutes(),
                    session.getCost(),
                    session.getRating(),
                    session.getMemo(),
                    productNames
            );
        }
    }

    public record PostSummary(
            Long id,
            Long authorId,
            String authorNickname,
            String postType,
            String title,
            String contentPreview,
            int viewCount,
            long likeCount,
            int commentCount,
            WashSessionEmbed washSession,
            LocalDateTime createdAt
    ) {
        public static PostSummary from(Post post) {
            String preview = post.getContent();
            if (preview != null && preview.length() > 100) {
                preview = preview.substring(0, 100);
            }
            WashSessionEmbed embed = post.getWashSession() != null
                    ? WashSessionEmbed.from(post.getWashSession()) : null;
            return new PostSummary(
                    post.getId(),
                    post.getUser().getId(),
                    post.getUser().getNickname(),
                    post.getPostType(),
                    post.getTitle(),
                    preview,
                    post.getViewCount(),
                    post.getLikes().size(),
                    post.getComments().size(),
                    embed,
                    post.getCreatedAt()
            );
        }
    }

    public static PostResponse from(Post post, boolean likedByMe) {
        List<String> imageUrls = post.getImages().stream()
                .map(img -> img.getImageUrl())
                .toList();
        WashSessionEmbed embed = post.getWashSession() != null
                ? WashSessionEmbed.from(post.getWashSession()) : null;

        return new PostResponse(
                post.getId(),
                post.getUser().getId(),
                post.getUser().getNickname(),
                post.getPostType(),
                post.getTitle(),
                post.getContent(),
                post.getViewCount(),
                post.getLikes().size(),
                likedByMe,
                (int) post.getComments().stream().filter(c -> c.getParent() == null).count()
                        + post.getComments().stream().mapToInt(c -> c.getReplies().size()).sum(),
                imageUrls,
                embed,
                post.getCreatedAt(),
                post.getUpdatedAt()
        );
    }
}
