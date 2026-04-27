package com.catwashhub.repository;

import com.catwashhub.domain.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ProductRepository extends JpaRepository<Product, Long> {

    // 공개 제품 전체 조회 (카테고리, 브랜드 필터)
    @Query("SELECT p FROM Product p WHERE p.visibility = 'PUBLIC'" +
           " AND (:categoryId IS NULL OR p.category.id = :categoryId)" +
           " AND (:brand IS NULL OR p.brand = :brand)" +
           " AND (:keyword IS NULL OR p.name LIKE %:keyword%)" +
           " ORDER BY p.createdAt DESC")
    List<Product> findPublicProducts(@Param("categoryId") Long categoryId,
                                     @Param("brand") String brand,
                                     @Param("keyword") String keyword);

    // 내가 등록한 제품 조회
    List<Product> findByUserIdOrderByCreatedAtDesc(Long userId);
}
