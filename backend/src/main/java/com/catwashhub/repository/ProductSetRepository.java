package com.catwashhub.repository;

import com.catwashhub.domain.ProductSet;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ProductSetRepository extends JpaRepository<ProductSet, Long> {

    List<ProductSet> findByUserIdOrderByIsDefaultDescCreatedAtAsc(Long userId);

    Optional<ProductSet> findByIdAndUserId(Long id, Long userId);
}
