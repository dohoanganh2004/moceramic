package com.example.moceramicshop.services;

import com.example.moceramicshop.dtos.request.product.ProductRequestDTO;
import com.example.moceramicshop.dtos.response.product.ProductResponseDTO;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface ProductService {
    List<ProductResponseDTO> getAllProducts();
    ProductResponseDTO getProductById(Long id);
    ProductResponseDTO create(ProductRequestDTO dto, List<MultipartFile> files);
    ProductResponseDTO update(Long id, ProductRequestDTO dto);
    void delete(Long id);
}
