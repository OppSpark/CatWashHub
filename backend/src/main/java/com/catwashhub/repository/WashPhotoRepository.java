package com.catwashhub.repository;

import com.catwashhub.domain.WashPhoto;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface WashPhotoRepository extends JpaRepository<WashPhoto, Long> {

    List<WashPhoto> findByWashSessionId(Long sessionId);
}
