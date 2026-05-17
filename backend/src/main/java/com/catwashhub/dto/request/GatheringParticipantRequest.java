package com.catwashhub.dto.request;

public record GatheringParticipantRequest(
        String status,
        Boolean showPlate,
        Boolean showCarInfo
) {}
