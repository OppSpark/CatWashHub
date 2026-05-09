package com.catwashhub.domain;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "wash_products")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class WashProduct {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "session_id", nullable = false)
    private WashSession washSession;

    // 기존 제품DB 연결 (선택사항 - 직접 입력 시 null)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id")
    private Product product;

    // 직접 입력한 경우 저장
    @Column(length = 100)
    private String customName;

    @Column(length = 100)
    private String category;

    @Column(length = 200)
    private String memo;

    @Column(nullable = false)
    private Integer sortOrder;

    @Builder
    public WashProduct(WashSession washSession, Product product, String customName,
                       String category, String memo, Integer sortOrder) {
        this.washSession = washSession;
        this.product = product;
        this.customName = customName;
        this.category = category;
        this.memo = memo;
        this.sortOrder = (sortOrder != null) ? sortOrder : 0;
    }

    public String getDisplayName() {
        return (product != null) ? product.getName() : customName;
    }
}
