package com.catwashhub.domain;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "gatherings")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Gathering {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "host_id", nullable = false)
    private User host;

    @Column(nullable = false, length = 100)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false)
    private LocalDateTime gatheringAt;

    @Column(nullable = false, length = 100)
    private String location;

    @Column(length = 200)
    private String locationDetail;

    private Integer maxParticipants;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private GatheringStatus status;

    // 개설자 차량 공개 설정
    @Column(nullable = false)
    private Boolean showPlate;

    @Column(nullable = false)
    private Integer plateDigits; // 공개할 뒷자리 수 (2~4)

    @Column(nullable = false)
    private Boolean showCarInfo;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(nullable = false)
    private LocalDateTime updatedAt;

    @Builder
    public Gathering(User host, String title, String description, LocalDateTime gatheringAt,
                     String location, String locationDetail, Integer maxParticipants,
                     Boolean showPlate, Integer plateDigits, Boolean showCarInfo) {
        this.host = host;
        this.title = title;
        this.description = description;
        this.gatheringAt = gatheringAt;
        this.location = location;
        this.locationDetail = locationDetail;
        this.maxParticipants = maxParticipants;
        this.showPlate = showPlate != null ? showPlate : false;
        this.plateDigits = (plateDigits != null && plateDigits >= 2 && plateDigits <= 4) ? plateDigits : 2;
        this.showCarInfo = showCarInfo != null ? showCarInfo : false;
        this.status = GatheringStatus.OPEN;
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    public void update(String _title, String _description, LocalDateTime _gatheringAt,
                       String _location, String _locationDetail, Integer _maxParticipants,
                       Boolean _showPlate, Integer _plateDigits, Boolean _showCarInfo) {
        this.title = _title;
        this.description = _description;
        this.gatheringAt = _gatheringAt;
        this.location = _location;
        this.locationDetail = _locationDetail;
        this.maxParticipants = _maxParticipants;
        this.showPlate = _showPlate;
        this.plateDigits = (_plateDigits != null && _plateDigits >= 2 && _plateDigits <= 4) ? _plateDigits : 2;
        this.showCarInfo = _showCarInfo;
        this.updatedAt = LocalDateTime.now();
    }

    public void close() {
        this.status = GatheringStatus.CLOSED;
        this.updatedAt = LocalDateTime.now();
    }

    public enum GatheringStatus {
        OPEN, CLOSED
    }
}
