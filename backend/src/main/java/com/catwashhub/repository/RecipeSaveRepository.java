package com.catwashhub.repository;

import com.catwashhub.domain.RecipeSave;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface RecipeSaveRepository extends JpaRepository<RecipeSave, Long> {

    boolean existsByUserIdAndRecipeId(Long userId, Long recipeId);

    Optional<RecipeSave> findByUserIdAndRecipeId(Long userId, Long recipeId);

    List<RecipeSave> findByUserIdOrderByCreatedAtDesc(Long userId);

    long countByRecipeId(Long recipeId);
}
