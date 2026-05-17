package com.catwashhub.dto.response;

import com.catwashhub.domain.UserCar;

public record UserCarResponse(
        Long id,
        String carModel,
        String carColor,
        String plateNumber
) {
    public static UserCarResponse from(UserCar car) {
        return new UserCarResponse(
                car.getId(),
                car.getCarModel(),
                car.getCarColor(),
                car.getPlateNumber()
        );
    }
}
