package com.catwashhub.dto.request;

public record GatheringParticipantRequest(
        String status,
        Boolean showPlate,
        Integer plateDigits,
        Boolean showCarInfo
) {}
