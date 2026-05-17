package com.catwashhub.dto.response;

import com.catwashhub.domain.Gathering;
import com.catwashhub.domain.UserCar;
import com.catwashhub.util.PlateUtil;

import java.time.LocalDateTime;
import java.util.List;

public record GatheringResponse(
        Long id,
        String title,
        String description,
        LocalDateTime gatheringAt,
        String location,
        String locationDetail,
        Integer maxParticipants,
        String status,
        Long hostId,
        String hostNickname,
        String hostMaskedPlate,
        String hostCarModel,
        String hostCarColor,
        int joinCount,
        boolean isBookmarked,
        boolean isParticipating,
        String myStatus,
        LocalDateTime createdAt,
        List<GatheringParticipantResponse> participants,
        List<GatheringCommentResponse> comments
) {
    public static GatheringResponse from(
            Gathering g,
            UserCar hostCar,
            int joinCount,
            boolean isBookmarked,
            String myStatus,
            List<GatheringParticipantResponse> participants,
            List<GatheringCommentResponse> comments
    ) {
        String maskedPlate = null;
        String carModel = null;
        String carColor = null;

        if (hostCar != null) {
            if (Boolean.TRUE.equals(g.getShowPlate())) {
                maskedPlate = PlateUtil.mask(hostCar.getPlateNumber(), g.getPlateDigits() != null ? g.getPlateDigits() : 2);
            }
            if (Boolean.TRUE.equals(g.getShowCarInfo())) {
                carModel = hostCar.getCarModel();
                carColor = hostCar.getCarColor();
            }
        }

        return new GatheringResponse(
                g.getId(),
                g.getTitle(),
                g.getDescription(),
                g.getGatheringAt(),
                g.getLocation(),
                g.getLocationDetail(),
                g.getMaxParticipants(),
                g.getStatus().name(),
                g.getHost().getId(),
                g.getHost().getNickname(),
                maskedPlate,
                carModel,
                carColor,
                joinCount,
                isBookmarked,
                myStatus != null,
                myStatus,
                g.getCreatedAt(),
                participants,
                comments
        );
    }
}
