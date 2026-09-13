package com.example.moceramicshop.services;

import com.example.moceramicshop.dtos.request.product.ProductRequestDTO;
import com.example.moceramicshop.dtos.response.product.ProductResponseDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.util.List;

public interface ProductService {
    List<ProductResponseDTO> getAllProducts();
    Page<ProductResponseDTO> search(String search, Long categoryId, String status, BigDecimal minPrice, BigDecimal maxPrice, Pageable pageable);
    ProductResponseDTO getProductById(Long id);
    ProductResponseDTO create(ProductRequestDTO dto, List<MultipartFile> files);
    ProductResponseDTO update(Long id, ProductRequestDTO dto);
    void delete(Long id);
}
