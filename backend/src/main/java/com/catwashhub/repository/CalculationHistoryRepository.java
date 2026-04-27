package com.catwashhub.repository;

import com.catwashhub.domain.CalculationHistory;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CalculationHistoryRepository extends JpaRepository<CalculationHistory, Long> {

    List<CalculationHistory> findByUserIdOrderByCreatedAtDesc(Long userId);
}
