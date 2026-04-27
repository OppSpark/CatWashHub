package com.catwashhub.domain;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "categories")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Category {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 50)
    private String name;

    @Column(nullable = false)
    private Integer sortOrder;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Builder
    public Category(String name, Integer sortOrder) {
        this.name = name;
        this.sortOrder = (sortOrder != null) ? sortOrder : 0;
        this.createdAt = LocalDateTime.now();
    }

    public void updateName(String _name) {
        this.name = _name;
    }

    public void updateSortOrder(Integer _sortOrder) {
        this.sortOrder = _sortOrder;
    }
}
