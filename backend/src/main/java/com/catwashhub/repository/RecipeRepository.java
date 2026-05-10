package com.catwashhub.repository;

import com.catwashhub.domain.Recipe;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface RecipeRepository extends JpaRepository<Recipe, Long> {

    // 공개 레시피 목록 (검색 + 차종 필터)
    @Query("SELECT r FROM Recipe r WHERE r.visibility = 'PUBLIC'" +
           " AND (:keyword IS NULL OR r.title LIKE %:keyword% OR r.description LIKE %:keyword%)" +
           " AND (:carModel IS NULL OR r.carModel = :carModel)" +
           " ORDER BY r.createdAt DESC")
    Page<Recipe> findPublicRecipes(@Param("keyword") String keyword,
                                   @Param("carModel") String carModel,
                                   Pageable pageable);

    // 인기 레시피 (저장수 기준)
    @Query("SELECT r FROM Recipe r WHERE r.visibility = 'PUBLIC' ORDER BY r.saveCount DESC")
    List<Recipe> findTopRecipes(Pageable pageable);

    // 내 레시피 목록
    List<Recipe> findByUserIdOrderByCreatedAtDesc(Long userId);
}
