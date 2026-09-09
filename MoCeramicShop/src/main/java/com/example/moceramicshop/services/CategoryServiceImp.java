package com.example.moceramicshop.services;

import com.example.moceramicshop.dtos.request.category.CategoryRequestDTO;
import com.example.moceramicshop.dtos.response.category.CategoryResponseDTO;
import com.example.moceramicshop.exceptions.BadRequestException;
import com.example.moceramicshop.exceptions.ConflictException;
import com.example.moceramicshop.exceptions.ResourceNotFoundException;
import com.example.moceramicshop.mappers.CategoryMapper;
import com.example.moceramicshop.models.Category;
import com.example.moceramicshop.repositories.CategoryRepository;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;

@Service
public class CategoryServiceImp implements CategoryService {

    private final CategoryRepository categoryRepository;
    private final CategoryMapper categoryMapper;

    public CategoryServiceImp(CategoryRepository categoryRepository, CategoryMapper categoryMapper) {
        this.categoryRepository = categoryRepository;
        this.categoryMapper = categoryMapper;
    }

    @Override
    public List<CategoryResponseDTO> getAllCategories() {
        return categoryRepository.findAll().stream()
                .map(categoryMapper::toResponseDTO)
                .toList();
    }

    @Override
    public CategoryResponseDTO getCategoryById(Long id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy danh mục với id " + id));
        return categoryMapper.toResponseDTO(category);
    }

    @Override
    public CategoryResponseDTO create(CategoryRequestDTO dto) {
        if (categoryRepository.existsBySlug(dto.getSlug())) {
            throw new ConflictException("Slug đã tồn tại, vui lòng chọn slug khác");
        }

        Category category = new Category();
        category.setParent(resolveParent(dto.getParentId(), null));
        category.setName(dto.getName());
        category.setSlug(dto.getSlug());
        category.setDescription(dto.getDescription());
        category.setImageUrl(dto.getImageUrl());
        category.setSortOrder(dto.getSortOrder() != null ? dto.getSortOrder() : 0);
        category.setCreatedAt(Instant.now());
        category.setUpdatedAt(Instant.now());

        return categoryMapper.toResponseDTO(categoryRepository.saveAndFlush(category));
    }

    @Override
    public CategoryResponseDTO update(Long id, CategoryRequestDTO dto) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy danh mục với id " + id));

        if (!category.getSlug().equals(dto.getSlug()) && categoryRepository.existsBySlug(dto.getSlug())) {
            throw new ConflictException("Slug đã tồn tại, vui lòng chọn slug khác");
        }

        category.setParent(resolveParent(dto.getParentId(), id));
        category.setName(dto.getName());
        category.setSlug(dto.getSlug());
        category.setDescription(dto.getDescription());
        category.setImageUrl(dto.getImageUrl());
        category.setSortOrder(dto.getSortOrder() != null ? dto.getSortOrder() : 0);
        category.setUpdatedAt(Instant.now());

        return categoryMapper.toResponseDTO(categoryRepository.saveAndFlush(category));
    }

    @Override
    public void delete(Long id) {
        if (!categoryRepository.existsById(id)) {
            throw new ResourceNotFoundException("Không tìm thấy danh mục với id " + id);
        }
        categoryRepository.deleteById(id);
    }

    @Override
    public List<CategoryResponseDTO> getRootCategories() {
        return categoryRepository.findByParentIsNullOrderBySortOrderAsc().stream()
                .map(categoryMapper::toResponseDTO)
                .toList();
    }

    @Override
    public List<CategoryResponseDTO> getChildren(Long parentId) {
        return categoryRepository.findByParent_IdOrderBySortOrderAsc(parentId).stream()
                .map(categoryMapper::toResponseDTO)
                .toList();
    }

    private Category resolveParent(Long parentId, Long selfId) {
        if (parentId == null) {
            return null;
        }
        if (parentId.equals(selfId)) {
            throw new BadRequestException("Danh mục không thể là danh mục cha của chính nó");
        }
        return categoryRepository.findById(parentId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy danh mục cha với id " + parentId));
    }
}
