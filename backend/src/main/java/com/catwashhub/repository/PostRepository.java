package com.catwashhub.repository;

import com.catwashhub.domain.Post;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PostRepository extends JpaRepository<Post, Long> {

    Page<Post> findAllByOrderByCreatedAtDesc(Pageable pageable);

    Page<Post> findByTitleContainingOrContentContainingOrderByCreatedAtDesc(
            String title, String content, Pageable pageable);
}
