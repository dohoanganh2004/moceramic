package com.example.moceramicshop.services;

import com.example.moceramicshop.dtos.request.category.CategoryRequestDTO;
import com.example.moceramicshop.dtos.response.category.CategoryResponseDTO;
import com.example.moceramicshop.exceptions.BadRequestException;
import com.example.moceramicshop.exceptions.ConflictException;
import com.example.moceramicshop.exceptions.ResourceNotFoundException;
import com.example.moceramicshop.mappers.CategoryMapper;
import com.example.moceramicshop.models.Category;
import com.example.moceramicshop.repositories.CategoryRepository;
import com.example.moceramicshop.specifications.CategorySpecification;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.time.Instant;
import java.util.List;

@Slf4j
@Service
public class CategoryServiceImp implements CategoryService {

    private final CategoryRepository categoryRepository;
    private final CategoryMapper categoryMapper;
    private final FileStorageService fileStorageService;

    public CategoryServiceImp(CategoryRepository categoryRepository, CategoryMapper categoryMapper,
                               FileStorageService fileStorageService) {
        this.categoryRepository = categoryRepository;
        this.categoryMapper = categoryMapper;
        this.fileStorageService = fileStorageService;
    }

    @Override
    public List<CategoryResponseDTO> getAllCategories() {
        return categoryRepository.findAll().stream()
                .map(categoryMapper::toResponseDTO)
                .toList();
    }

    @Override
    public Page<CategoryResponseDTO> search(String search, Long parentId, Pageable pageable) {
        Specification<Category> spec = Specification
                .where(CategorySpecification.hasNameContaining(search))
                .and(CategorySpecification.hasParentId(parentId));
        log.info("Searching categories: search={} parentId={} page={}", search, parentId, pageable);
        return categoryRepository.findAll(spec, pageable).map(categoryMapper::toResponseDTO);
    }

    @Override
    public CategoryResponseDTO getCategoryById(Long id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy danh mục với id " + id));
        return categoryMapper.toResponseDTO(category);
    }

    @Override
    public CategoryResponseDTO create(CategoryRequestDTO dto, MultipartFile image) {
        if (categoryRepository.existsBySlug(dto.getSlug())) {
            throw new ConflictException("Slug đã tồn tại, vui lòng chọn slug khác");
        }

        String imageUrl = (image != null && !image.isEmpty())
                ? fileStorageService.store(image)
                : dto.getImageUrl();

        Category category = new Category();
        category.setParent(resolveParent(dto.getParentId(), null));
        category.setName(dto.getName());
        category.setSlug(dto.getSlug());
        category.setDescription(dto.getDescription());
        category.setImageUrl(imageUrl);
        category.setSortOrder(dto.getSortOrder() != null ? dto.getSortOrder() : 0);
        category.setCreatedAt(Instant.now());
        category.setUpdatedAt(Instant.now());

        Category saved = categoryRepository.saveAndFlush(category);
        log.info("Created category id={} slug={}", saved.getId(), saved.getSlug());
        return categoryMapper.toResponseDTO(saved);
    }

    @Override
    public CategoryResponseDTO update(Long id, CategoryRequestDTO dto, MultipartFile image) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy danh mục với id " + id));

        if (!category.getSlug().equals(dto.getSlug()) && categoryRepository.existsBySlug(dto.getSlug())) {
            throw new ConflictException("Slug đã tồn tại, vui lòng chọn slug khác");
        }

        if (image != null && !image.isEmpty()) {
            if (category.getImageUrl() != null) {
                fileStorageService.delete(category.getImageUrl());
            }
            category.setImageUrl(fileStorageService.store(image));
        } else if (dto.getImageUrl() != null) {
            category.setImageUrl(dto.getImageUrl());
        }

        category.setParent(resolveParent(dto.getParentId(), id));
        category.setName(dto.getName());
        category.setSlug(dto.getSlug());
        category.setDescription(dto.getDescription());
        category.setSortOrder(dto.getSortOrder() != null ? dto.getSortOrder() : 0);
        category.setUpdatedAt(Instant.now());

        log.info("Updated category id={}", id);
        return categoryMapper.toResponseDTO(categoryRepository.saveAndFlush(category));
    }

    @Override
    public void delete(Long id) {
        if (!categoryRepository.existsById(id)) {
            throw new ResourceNotFoundException("Không tìm thấy danh mục với id " + id);
        }
        categoryRepository.deleteById(id);
        log.info("Deleted category id={}", id);
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
