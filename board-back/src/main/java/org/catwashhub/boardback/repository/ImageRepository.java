package org.catwashhub.boardback.repository;

import org.catwashhub.boardback.entity.ImageEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.awt.*;

@Repository
public interface ImageRepository extends JpaRepository<ImageEntity, Integer> {
}
