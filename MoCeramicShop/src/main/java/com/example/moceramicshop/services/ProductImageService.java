package com.example.moceramicshop.services;

import com.example.moceramicshop.dtos.response.product.ProductImageResponseDTO;
import org.springframework.web.multipart.MultipartFile;

public interface ProductImageService {
    ProductImageResponseDTO addImage(Long productId, MultipartFile file, Boolean isPrimary);
    void deleteImage(Long productId, Long imageId);
}
