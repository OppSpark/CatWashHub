package com.catwashhub.repository;

import com.catwashhub.domain.UserCar;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserCarRepository extends JpaRepository<UserCar, Long> {
    Optional<UserCar> findByUserId(Long userId);
}
