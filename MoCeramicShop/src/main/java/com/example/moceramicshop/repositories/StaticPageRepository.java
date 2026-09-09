package com.example.moceramicshop.repositories;

import com.example.moceramicshop.models.StaticPage;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface StaticPageRepository extends JpaRepository<StaticPage, Long> {
    boolean existsBySlug(String slug);

    Optional<StaticPage> findBySlug(String slug);
}
