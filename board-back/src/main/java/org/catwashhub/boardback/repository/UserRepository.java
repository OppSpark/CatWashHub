package org.catwashhub.boardback.repository;

import org.catwashhub.boardback.entity.UserEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface UserRepository extends JpaRepository <UserEntity, String>{
}
