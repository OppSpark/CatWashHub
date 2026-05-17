package com.catwashhub.dto.request;

public record UserCarRequest(
        String carModel,
        String carColor,
        String plateNumber
) {}
