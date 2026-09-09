package com.example.moceramicshop.repositories;

import com.example.moceramicshop.models.Category;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CategoryRepository extends JpaRepository<Category, Long> {
    boolean existsBySlug(String slug);

    List<Category> findByParentIsNullOrderBySortOrderAsc();

    List<Category> findByParent_IdOrderBySortOrderAsc(Long parentId);
}
