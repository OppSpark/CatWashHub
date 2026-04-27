package com.catwashhub.domain;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "favorites")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Favorite {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "dilution_ratio_id")
    private DilutionRatio dilutionRatio;

    private Integer customRatio;

    @Column(length = 100)
    private String nickname;

    @Column(nullable = false)
    private Integer sortOrder;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Builder
    public Favorite(User user, Product product, DilutionRatio dilutionRatio,
                    Integer customRatio, String nickname, Integer sortOrder) {
        this.user = user;
        this.product = product;
        this.dilutionRatio = dilutionRatio;
        this.customRatio = customRatio;
        this.nickname = nickname;
        this.sortOrder = (sortOrder != null) ? sortOrder : 0;
        this.createdAt = LocalDateTime.now();
    }

    public void updateSortOrder(Integer _sortOrder) {
        this.sortOrder = _sortOrder;
    }

    public void updateNickname(String _nickname) {
        this.nickname = _nickname;
    }

    // 즐겨찾기에서 실제 사용할 희석비 반환 (직접입력 우선)
    public Integer getEffectiveRatio() {
        if (customRatio != null) {
            return customRatio;
        }
        return (dilutionRatio != null) ? dilutionRatio.getRatio() : null;
    }
}
