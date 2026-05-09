package com.catwashhub.repository;

import com.catwashhub.domain.ProductSetItem;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ProductSetItemRepository extends JpaRepository<ProductSetItem, Long> {

    List<ProductSetItem> findByProductSetIdOrderBySortOrderAsc(Long setId);

    void deleteByProductSetId(Long setId);
}
