package com.example.moceramicshop.services;

import com.example.moceramicshop.dtos.request.category.CategoryRequestDTO;
import com.example.moceramicshop.dtos.response.category.CategoryResponseDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface CategoryService {
    List<CategoryResponseDTO> getAllCategories();
    Page<CategoryResponseDTO> search(String search, Long parentId, Pageable pageable);
    CategoryResponseDTO getCategoryById(Long id);
    CategoryResponseDTO create(CategoryRequestDTO dto);
    CategoryResponseDTO update(Long id, CategoryRequestDTO dto);
    void delete(Long id);

    List<CategoryResponseDTO> getRootCategories();
    List<CategoryResponseDTO> getChildren(Long parentId);
}
