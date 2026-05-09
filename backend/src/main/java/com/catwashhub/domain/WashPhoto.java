package com.catwashhub.domain;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "wash_photos")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class WashPhoto {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "session_id", nullable = false)
    private WashSession washSession;

    @Column(nullable = false, length = 500)
    private String photoUrl;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PhotoType photoType;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Builder
    public WashPhoto(WashSession washSession, String photoUrl, PhotoType photoType) {
        this.washSession = washSession;
        this.photoUrl = photoUrl;
        this.photoType = photoType;
        this.createdAt = LocalDateTime.now();
    }

    public enum PhotoType {
        BEFORE, AFTER, ETC
    }
}
