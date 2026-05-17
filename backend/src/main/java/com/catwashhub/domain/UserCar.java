package com.catwashhub.domain;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "user_cars")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class UserCar {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(length = 50)
    private String carModel;

    @Column(length = 30)
    private String carColor;

    @Column(length = 20)
    private String plateNumber;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    @Column(nullable = false)
    private LocalDateTime updatedAt;

    @Builder
    public UserCar(User user, String carModel, String carColor, String plateNumber) {
        this.user = user;
        this.carModel = carModel;
        this.carColor = carColor;
        this.plateNumber = plateNumber;
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    public void update(String _carModel, String _carColor, String _plateNumber) {
        this.carModel = _carModel;
        this.carColor = _carColor;
        this.plateNumber = _plateNumber;
        this.updatedAt = LocalDateTime.now();
    }
}
