package com.catwashhub.domain;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "products")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id")
    private Category category;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(length = 100)
    private String brand;

    @Column(columnDefinition = "TEXT")
    private String description;

    private Integer price;

    @Column(precision = 6, scale = 1)
    private BigDecimal capacityMl;

    @Column(length = 500)
    private String imageUrl;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Visibility visibility;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(nullable = false)
    private LocalDateTime updatedAt;

    @OneToMany(mappedBy = "product", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<DilutionRatio> dilutionRatios = new ArrayList<>();

    @Builder
    public Product(User user, Category category, String name, String brand,
                   String description, Integer price, BigDecimal capacityMl,
                   String imageUrl, Visibility visibility) {
        this.user = user;
        this.category = category;
        this.name = name;
        this.brand = brand;
        this.description = description;
        this.price = price;
        this.capacityMl = capacityMl;
        this.imageUrl = imageUrl;
        this.visibility = (visibility != null) ? visibility : Visibility.PUBLIC;
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    public void update(Category _category, String _name, String _brand,
                       String _description, Integer _price, BigDecimal _capacityMl,
                       Visibility _visibility) {
        this.category = _category;
        this.name = _name;
        this.brand = _brand;
        this.description = _description;
        this.price = _price;
        this.capacityMl = _capacityMl;
        this.visibility = _visibility;
        this.updatedAt = LocalDateTime.now();
    }

    public enum Visibility {
        PUBLIC, PRIVATE
    }
}
