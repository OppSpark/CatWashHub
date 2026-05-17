package com.catwashhub.domain;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "manner_ratings",
        uniqueConstraints = @UniqueConstraint(columnNames = {"gathering_id", "rater_id", "rated_id"}))
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class MannerRating {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "gathering_id", nullable = false)
    private Gathering gathering;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "rater_id", nullable = false)
    private User rater;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "rated_id", nullable = false)
    private User rated;

    // +1 (좋음) or -1 (나쁨)
    @Column(nullable = false)
    private Integer score;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    @Builder
    public MannerRating(Gathering gathering, User rater, User rated, Integer score) {
        this.gathering = gathering;
        this.rater = rater;
        this.rated = rated;
        this.score = score;
        this.createdAt = LocalDateTime.now();
    }
}
