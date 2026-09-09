package com.example.moceramicshop.services;

import com.example.moceramicshop.dtos.request.product.ProductVariantRequestDTO;
import com.example.moceramicshop.dtos.response.product.ProductVariantResponseDTO;

public interface ProductVariantService {
    ProductVariantResponseDTO update(Long productId, Long variantId, ProductVariantRequestDTO dto);
    void delete(Long productId, Long variantId);
}
