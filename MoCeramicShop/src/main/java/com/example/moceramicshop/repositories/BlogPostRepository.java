package com.example.moceramicshop.repositories;

import com.example.moceramicshop.models.BlogPost;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.List;
import java.util.Optional;

public interface BlogPostRepository extends JpaRepository<BlogPost, Long>, JpaSpecificationExecutor<BlogPost> {
    boolean existsBySlug(String slug);

    @EntityGraph(attributePaths = "author")
    Optional<BlogPost> findWithAuthorById(Long id);

    @EntityGraph(attributePaths = "author")
    Optional<BlogPost> findWithAuthorBySlugAndStatus(String slug, String status);

    @EntityGraph(attributePaths = "author")
    Page<BlogPost> findByStatusOrderByPublishedAtDesc(String status, Pageable pageable);

    @Override
    @EntityGraph(attributePaths = "author")
    List<BlogPost> findAll();
}
