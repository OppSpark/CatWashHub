package com.catwashhub.dto.request;

import java.time.LocalDateTime;

public record GatheringRequest(
        String title,
        String description,
        LocalDateTime gatheringAt,
        String location,
        String locationDetail,
        Integer maxParticipants,
        Boolean showPlate,
        Boolean showCarInfo
) {}
