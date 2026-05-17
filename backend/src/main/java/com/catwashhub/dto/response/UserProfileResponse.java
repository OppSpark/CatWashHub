package com.catwashhub.dto.response;

import com.catwashhub.domain.User;
import com.catwashhub.domain.UserCar;

import java.time.LocalDateTime;

public record UserProfileResponse(
        Long userId,
        String nickname,
        LocalDateTime joinedAt,
        long washCount,
        long totalPostLikes,
        String carModel,
        String carColor
) {
    public static UserProfileResponse from(User user, UserCar car, long washCount, long totalPostLikes) {
        return new UserProfileResponse(
                user.getId(),
                user.getNickname(),
                user.getCreatedAt(),
                washCount,
                totalPostLikes,
                car != null ? car.getCarModel() : null,
                car != null ? car.getCarColor() : null
        );
    }
}
