package com.catwashhub.domain;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "recipes")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Recipe {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false, length = 100)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(length = 100)
    private String carModel;

    private Integer estimatedMinutes;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Visibility visibility;

    @Column(nullable = false)
    private Integer saveCount;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(nullable = false)
    private LocalDateTime updatedAt;

    @OneToMany(mappedBy = "recipe", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("stepOrder ASC")
    private List<RecipeStep> steps = new ArrayList<>();

    @Builder
    public Recipe(User user, String title, String description,
                  String carModel, Integer estimatedMinutes, Visibility visibility) {
        this.user = user;
        this.title = title;
        this.description = description;
        this.carModel = carModel;
        this.estimatedMinutes = estimatedMinutes;
        this.visibility = (visibility != null) ? visibility : Visibility.PUBLIC;
        this.saveCount = 0;
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    public void update(String _title, String _description, String _carModel,
                       Integer _estimatedMinutes, Visibility _visibility) {
        this.title = _title;
        this.description = _description;
        this.carModel = _carModel;
        this.estimatedMinutes = _estimatedMinutes;
        this.visibility = _visibility;
        this.updatedAt = LocalDateTime.now();
    }

    public void syncSaveCount(long _count) {
        this.saveCount = (int) _count;
    }

    public boolean isOwner(Long _userId) {
        return this.user.getId().equals(_userId);
    }

    public enum Visibility {
        PUBLIC, PRIVATE
    }
}
