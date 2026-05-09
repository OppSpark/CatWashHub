package com.catwashhub.domain;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "product_set_items")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class ProductSetItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "set_id", nullable = false)
    private ProductSet productSet;

    // 기존 제품DB 연결 (선택사항 - 직접 입력 시 null)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id")
    private Product product;

    // 직접 입력한 경우 저장
    @Column(length = 100)
    private String customName;

    @Column(length = 100)
    private String category;

    @Column(nullable = false)
    private Integer sortOrder;

    @Builder
    public ProductSetItem(ProductSet productSet, Product product, String customName,
                          String category, Integer sortOrder) {
        this.productSet = productSet;
        this.product = product;
        this.customName = customName;
        this.category = category;
        this.sortOrder = (sortOrder != null) ? sortOrder : 0;
    }

    public String getDisplayName() {
        return (product != null) ? product.getName() : customName;
    }
}
