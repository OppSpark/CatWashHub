package com.catwashhub.domain;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "gathering_participants",
        uniqueConstraints = @UniqueConstraint(columnNames = {"gathering_id", "user_id"}))
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class GatheringParticipant {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "gathering_id", nullable = false)
    private Gathering gathering;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ParticipantStatus status;

    // 참여자 차량 공개 설정
    @Column(nullable = false)
    private Boolean showPlate;

    @Column(nullable = false)
    private Integer plateDigits; // 공개할 뒷자리 수 (2~4)

    @Column(nullable = false)
    private Boolean showCarInfo;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    @Column(nullable = false)
    private LocalDateTime updatedAt;

    @Builder
    public GatheringParticipant(Gathering gathering, User user, ParticipantStatus status,
                                 Boolean showPlate, Integer plateDigits, Boolean showCarInfo) {
        this.gathering = gathering;
        this.user = user;
        this.status = status != null ? status : ParticipantStatus.JOIN;
        this.showPlate = showPlate != null ? showPlate : false;
        this.plateDigits = (plateDigits != null && plateDigits >= 2 && plateDigits <= 4) ? plateDigits : 2;
        this.showCarInfo = showCarInfo != null ? showCarInfo : false;
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    public void updateStatus(ParticipantStatus _status) {
        this.status = _status;
        this.updatedAt = LocalDateTime.now();
    }

    public void updateVisibility(Boolean _showPlate, Integer _plateDigits, Boolean _showCarInfo) {
        this.showPlate = _showPlate;
        this.plateDigits = (_plateDigits != null && _plateDigits >= 2 && _plateDigits <= 4) ? _plateDigits : 2;
        this.showCarInfo = _showCarInfo;
        this.updatedAt = LocalDateTime.now();
    }

    public enum ParticipantStatus {
        JOIN, MAYBE, CANCEL
    }
}
