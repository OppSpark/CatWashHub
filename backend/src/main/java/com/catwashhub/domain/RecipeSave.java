package com.catwashhub.domain;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "recipe_saves",
        uniqueConstraints = @UniqueConstraint(columnNames = {"user_id", "recipe_id"}))
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class RecipeSave {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "recipe_id", nullable = false)
    private Recipe recipe;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Builder
    public RecipeSave(User user, Recipe recipe) {
        this.user = user;
        this.recipe = recipe;
        this.createdAt = LocalDateTime.now();
    }
}
