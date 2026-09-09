package com.example.moceramicshop.services;

import com.example.moceramicshop.dtos.request.product.ProductRequestDTO;
import com.example.moceramicshop.dtos.request.product.ProductVariantRequestDTO;
import com.example.moceramicshop.dtos.response.product.ProductResponseDTO;
import com.example.moceramicshop.exceptions.ConflictException;
import com.example.moceramicshop.exceptions.ResourceNotFoundException;
import com.example.moceramicshop.mappers.ProductMapper;
import com.example.moceramicshop.models.Category;
import com.example.moceramicshop.models.Product;
import com.example.moceramicshop.models.ProductImage;
import com.example.moceramicshop.models.ProductVariant;
import com.example.moceramicshop.repositories.CategoryRepository;
import com.example.moceramicshop.repositories.ProductRepository;
import com.example.moceramicshop.repositories.ProductVariantRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.Instant;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
public class ProductServiceImp implements ProductService {

    private static final String STATUS_ACTIVE = "active";

    private final ProductRepository productRepository;
    private final ProductVariantRepository productVariantRepository;
    private final CategoryRepository categoryRepository;
    private final ProductMapper productMapper;
    private final FileStorageService fileStorageService;

    public ProductServiceImp(ProductRepository productRepository,
                              ProductVariantRepository productVariantRepository,
                              CategoryRepository categoryRepository,
                              ProductMapper productMapper,
                              FileStorageService fileStorageService) {
        this.productRepository = productRepository;
        this.productVariantRepository = productVariantRepository;
        this.categoryRepository = categoryRepository;
        this.productMapper = productMapper;
        this.fileStorageService = fileStorageService;
    }

    @Override
    public List<ProductResponseDTO> getAllProducts() {
        return productRepository.findAll().stream()
                .map(productMapper::toResponseDTO)
                .toList();
    }

    @Override
    public ProductResponseDTO getProductById(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy sản phẩm với id " + id));
        return productMapper.toResponseDTO(product);
    }

    @Override
    @Transactional
    public ProductResponseDTO create(ProductRequestDTO dto, List<MultipartFile> files) {
        if (productRepository.existsBySlug(dto.getSlug())) {
            throw new ConflictException("Slug đã tồn tại, vui lòng chọn slug khác");
        }
        Category category = categoryRepository.findById(dto.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy danh mục với id " + dto.getCategoryId()));

        Product product = new Product();
        product.setCategory(category);
        product.setName(dto.getName());
        product.setSlug(dto.getSlug());
        product.setDescription(dto.getDescription());
        product.setCareInstructions(dto.getCareInstructions());
        product.setMaterial(dto.getMaterial());
        product.setOrigin(dto.getOrigin());
        product.setBasePrice(dto.getBasePrice());
        product.setStatus(STATUS_ACTIVE);
        product.setCreatedAt(Instant.now()); 
        product.setUpdatedAt(Instant.now());

        attachVariants(product, dto.getVariants());
        attachImages(product, files);

        return productMapper.toResponseDTO(productRepository.saveAndFlush(product));
    }

    @Override
    public ProductResponseDTO update(Long id, ProductRequestDTO dto) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy sản phẩm với id " + id));

        if (!product.getSlug().equals(dto.getSlug()) && productRepository.existsBySlug(dto.getSlug())) {
            throw new ConflictException("Slug đã tồn tại, vui lòng chọn slug khác");
        }
        if (!product.getCategory().getId().equals(dto.getCategoryId())) {
            Category category = categoryRepository.findById(dto.getCategoryId())
                    .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy danh mục với id " + dto.getCategoryId()));
            product.setCategory(category);
        }

        product.setName(dto.getName());
        product.setSlug(dto.getSlug());
        product.setDescription(dto.getDescription());
        product.setCareInstructions(dto.getCareInstructions());
        product.setMaterial(dto.getMaterial());
        product.setOrigin(dto.getOrigin());
        product.setBasePrice(dto.getBasePrice());
        product.setUpdatedAt(Instant.now());

        return productMapper.toResponseDTO(productRepository.saveAndFlush(product));
    }

    @Override
    public void delete(Long id) {
        if (!productRepository.existsById(id)) {
            throw new ResourceNotFoundException("Không tìm thấy sản phẩm với id " + id);
        }
        productRepository.deleteById(id);
    }

    private void attachVariants(Product product, List<ProductVariantRequestDTO> variantDtos) {
        if (variantDtos == null || variantDtos.isEmpty()) {
            return;
        }
        Set<String> seenSkus = new HashSet<>();
        for (ProductVariantRequestDTO variantDto : variantDtos) {
            if (!seenSkus.add(variantDto.getSku())) {
                throw new ConflictException("SKU bị trùng trong danh sách biến thể: " + variantDto.getSku());
            }
            if (productVariantRepository.existsBySku(variantDto.getSku())) {
                throw new ConflictException("SKU đã tồn tại: " + variantDto.getSku());
            }

            ProductVariant variant = new ProductVariant();
            variant.setProduct(product);
            variant.setSku(variantDto.getSku());
            variant.setColorGlaze(variantDto.getColorGlaze());
            variant.setSize(variantDto.getSize());
            variant.setPrice(variantDto.getPrice());
            variant.setWeightGrams(variantDto.getWeightGrams());
            variant.setDimensions(variantDto.getDimensions());
            variant.setCreatedAt(Instant.now());
            variant.setUpdatedAt(Instant.now());
            product.getVariants().add(variant);
        }
    }

    private void attachImages(Product product, List<MultipartFile> files) {
        if (files == null || files.isEmpty()) {
            return;
        }
        int sortOrder = 0;
        for (MultipartFile file : files) {
            if (file == null || file.isEmpty()) {
                continue;
            }
            String imageUrl = fileStorageService.store(file);

            ProductImage image = new ProductImage();
            image.setProduct(product);
            image.setImageUrl(imageUrl);
            image.setSortOrder(sortOrder);
            image.setIsPrimary(sortOrder == 0);
            product.getImages().add(image);
            sortOrder++;
        }
    }
}
