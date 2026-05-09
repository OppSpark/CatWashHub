package com.catwashhub.domain;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "wash_sessions")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class WashSession {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private LocalDate washedAt;

    @Column(length = 100)
    private String location;

    @Enumerated(EnumType.STRING)
    private Weather weather;

    private Integer durationMinutes;

    private Integer cost;

    private Integer rating;

    @Column(columnDefinition = "TEXT")
    private String memo;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(nullable = false)
    private LocalDateTime updatedAt;

    @OneToMany(mappedBy = "washSession", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<WashPhoto> photos = new ArrayList<>();

    @OneToMany(mappedBy = "washSession", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<WashProduct> washProducts = new ArrayList<>();

    @Builder
    public WashSession(User user, LocalDate washedAt, String location, Weather weather,
                       Integer durationMinutes, Integer cost, Integer rating, String memo) {
        this.user = user;
        this.washedAt = washedAt;
        this.location = location;
        this.weather = weather;
        this.durationMinutes = durationMinutes;
        this.cost = cost;
        this.rating = rating;
        this.memo = memo;
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    public void update(LocalDate _washedAt, String _location, Weather _weather,
                       Integer _durationMinutes, Integer _cost, Integer _rating, String _memo) {
        this.washedAt = _washedAt;
        this.location = _location;
        this.weather = _weather;
        this.durationMinutes = _durationMinutes;
        this.cost = _cost;
        this.rating = _rating;
        this.memo = _memo;
        this.updatedAt = LocalDateTime.now();
    }

    public enum Weather {
        SUNNY, CLOUDY, RAINY, SNOWY
    }
}
