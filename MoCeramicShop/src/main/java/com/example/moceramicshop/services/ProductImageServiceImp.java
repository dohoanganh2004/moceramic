package com.example.moceramicshop.services;

import com.example.moceramicshop.dtos.response.product.ProductImageResponseDTO;
import com.example.moceramicshop.exceptions.ResourceNotFoundException;
import com.example.moceramicshop.mappers.ProductImageMapper;
import com.example.moceramicshop.models.Product;
import com.example.moceramicshop.models.ProductImage;
import com.example.moceramicshop.repositories.ProductImageRepository;
import com.example.moceramicshop.repositories.ProductRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Service
public class ProductImageServiceImp implements ProductImageService {

    private final ProductRepository productRepository;
    private final ProductImageRepository productImageRepository;
    private final ProductImageMapper productImageMapper;
    private final FileStorageService fileStorageService;

    public ProductImageServiceImp(ProductRepository productRepository,
                                   ProductImageRepository productImageRepository,
                                   ProductImageMapper productImageMapper,
                                   FileStorageService fileStorageService) {
        this.productRepository = productRepository;
        this.productImageRepository = productImageRepository;
        this.productImageMapper = productImageMapper;
        this.fileStorageService = fileStorageService;
    }

    @Override
    @Transactional
    public ProductImageResponseDTO addImage(Long productId, MultipartFile file, Boolean isPrimary) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy sản phẩm với id " + productId));

        List<ProductImage> existing = productImageRepository.findByProduct_IdOrderBySortOrderAsc(productId);
        int nextSortOrder = existing.isEmpty() ? 0 : existing.get(existing.size() - 1).getSortOrder() + 1;
        boolean primary = existing.isEmpty() || Boolean.TRUE.equals(isPrimary);

        String imageUrl = fileStorageService.store(file);

        if (primary) {
            for (ProductImage image : existing) {
                if (Boolean.TRUE.equals(image.getIsPrimary())) {
                    image.setIsPrimary(false);
                }
            }
            productImageRepository.saveAll(existing);
        }

        ProductImage newImage = new ProductImage();
        newImage.setProduct(product);
        newImage.setImageUrl(imageUrl);
        newImage.setSortOrder(nextSortOrder);
        newImage.setIsPrimary(primary);

        return productImageMapper.toResponseDTO(productImageRepository.saveAndFlush(newImage));
    }

    @Override
    @Transactional
    public void deleteImage(Long productId, Long imageId) {
        ProductImage image = productImageRepository.findById(imageId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy ảnh với id " + imageId));
        if (image.getProduct() == null || !image.getProduct().getId().equals(productId)) {
            throw new ResourceNotFoundException("Ảnh " + imageId + " không thuộc sản phẩm " + productId);
        }

        boolean wasPrimary = Boolean.TRUE.equals(image.getIsPrimary());
        String imageUrl = image.getImageUrl();

        productImageRepository.delete(image);

        if (wasPrimary) {
            List<ProductImage> remaining = productImageRepository.findByProduct_IdOrderBySortOrderAsc(productId);
            if (!remaining.isEmpty()) {
                ProductImage next = remaining.get(0);
                next.setIsPrimary(true);
                productImageRepository.save(next);
            }
        }

        fileStorageService.delete(imageUrl);
    }
}
