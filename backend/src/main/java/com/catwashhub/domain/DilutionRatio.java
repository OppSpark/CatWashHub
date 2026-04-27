package com.catwashhub.domain;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "dilution_ratios")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class DilutionRatio {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @Column(nullable = false, length = 50)
    private String label;

    @Column(nullable = false)
    private Integer ratio;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Builder
    public DilutionRatio(Product product, String label, Integer ratio, String description) {
        this.product = product;
        this.label = label;
        this.ratio = ratio;
        this.description = description;
    }

    public void update(String _label, Integer _ratio, String _description) {
        this.label = _label;
        this.ratio = _ratio;
        this.description = _description;
    }
}
