package com.catwashhub.repository;

import com.catwashhub.domain.Favorite;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface FavoriteRepository extends JpaRepository<Favorite, Long> {

    List<Favorite> findByUserIdOrderBySortOrderAsc(Long userId);

    boolean existsByUserIdAndProductId(Long userId, Long productId);
}
