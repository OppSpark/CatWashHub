package org.catwashhub.boardback.repository;

import org.catwashhub.boardback.entity.FavoriteEntity;
import org.catwashhub.boardback.entity.primaryKey.FavoritePk;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface FavoriteRepository extends JpaRepository<FavoriteEntity, FavoritePk> {
}
