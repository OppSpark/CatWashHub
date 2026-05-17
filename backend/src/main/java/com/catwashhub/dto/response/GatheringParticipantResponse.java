package com.catwashhub.dto.response;

import com.catwashhub.domain.GatheringParticipant;
import com.catwashhub.domain.UserCar;
import com.catwashhub.util.PlateUtil;

public record GatheringParticipantResponse(
        Long userId,
        String nickname,
        String status,
        String maskedPlate,
        String carModel,
        String carColor
) {
    public static GatheringParticipantResponse from(GatheringParticipant p, UserCar car) {
        String maskedPlate = null;
        String carModel = null;
        String carColor = null;

        if (car != null) {
            if (Boolean.TRUE.equals(p.getShowPlate())) {
                maskedPlate = PlateUtil.mask(car.getPlateNumber());
            }
            if (Boolean.TRUE.equals(p.getShowCarInfo())) {
                carModel = car.getCarModel();
                carColor = car.getCarColor();
            }
        }

        return new GatheringParticipantResponse(
                p.getUser().getId(),
                p.getUser().getNickname(),
                p.getStatus().name(),
                maskedPlate,
                carModel,
                carColor
        );
    }
}
