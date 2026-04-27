package com.catwashhub.domain;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "calculation_histories")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class CalculationHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id")
    private Product product;

    @Column(nullable = false)
    private Integer ratio;

    @Column(nullable = false, precision = 6, scale = 1)
    private BigDecimal waterMl;

    @Column(nullable = false, precision = 6, scale = 1)
    private BigDecimal productMl;

    @Column(length = 255)
    private String memo;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Builder
    public CalculationHistory(User user, Product product, Integer ratio,
                               BigDecimal waterMl, BigDecimal productMl, String memo) {
        this.user = user;
        this.product = product;
        this.ratio = ratio;
        this.waterMl = waterMl;
        this.productMl = productMl;
        this.memo = memo;
        this.createdAt = LocalDateTime.now();
    }
}
