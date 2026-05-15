package com.catwashhub.repository;

import com.catwashhub.domain.Post;
import com.catwashhub.domain.WashSession;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface PostRepository extends JpaRepository<Post, Long> {

    Page<Post> findAllByOrderByCreatedAtDesc(Pageable pageable);

    Page<Post> findByPostTypeOrderByCreatedAtDesc(String postType, Pageable pageable);

    Page<Post> findByTitleContainingOrContentContainingOrderByCreatedAtDesc(
            String title, String content, Pageable pageable);

    @Query("SELECT p FROM Post p WHERE p.postType = :postType AND (p.title LIKE %:keyword% OR p.content LIKE %:keyword%) ORDER BY p.createdAt DESC")
    Page<Post> findByPostTypeAndKeyword(
            @Param("postType") String postType,
            @Param("keyword") String keyword,
            Pageable pageable);

    @Modifying
    @Query("UPDATE Post p SET p.washSession = NULL WHERE p.washSession = :washSession")
    void unlinkWashSession(@Param("washSession") WashSession washSession);
}
