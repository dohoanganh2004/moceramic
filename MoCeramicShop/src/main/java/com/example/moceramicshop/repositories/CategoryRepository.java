package com.example.moceramicshop.repositories;

import com.example.moceramicshop.models.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.List;

public interface CategoryRepository extends JpaRepository<Category, Long>, JpaSpecificationExecutor<Category> {
    boolean existsBySlug(String slug);

    List<Category> findByParentIsNullOrderBySortOrderAsc();

    List<Category> findByParent_IdOrderBySortOrderAsc(Long parentId);
}
