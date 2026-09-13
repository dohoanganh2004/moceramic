package com.example.moceramicshop.services;

import com.example.moceramicshop.dtos.request.product.ProductVariantRequestDTO;
import com.example.moceramicshop.dtos.response.product.ProductVariantResponseDTO;
import com.example.moceramicshop.exceptions.ConflictException;
import com.example.moceramicshop.exceptions.ResourceNotFoundException;
import com.example.moceramicshop.mappers.ProductVariantMapper;
import com.example.moceramicshop.models.Inventory;
import com.example.moceramicshop.models.ProductVariant;
import com.example.moceramicshop.repositories.ProductVariantRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.Instant;

@Slf4j
@Service
public class ProductVariantServiceImp implements ProductVariantService {

    private final ProductVariantRepository productVariantRepository;
    private final ProductVariantMapper productVariantMapper;

    public ProductVariantServiceImp(ProductVariantRepository productVariantRepository, ProductVariantMapper productVariantMapper) {
        this.productVariantRepository = productVariantRepository;
        this.productVariantMapper = productVariantMapper;
    }

    @Override
    public ProductVariantResponseDTO update(Long productId, Long variantId, ProductVariantRequestDTO dto) {
        ProductVariant variant = getOwnedVariant(productId, variantId);

        if (!variant.getSku().equals(dto.getSku()) && productVariantRepository.existsBySku(dto.getSku())) {
            throw new ConflictException("SKU đã tồn tại: " + dto.getSku());
        }

        variant.setSku(dto.getSku());
        variant.setColorGlaze(dto.getColorGlaze());
        variant.setSize(dto.getSize());
        variant.setPrice(dto.getPrice());
        variant.setWeightGrams(dto.getWeightGrams());
        variant.setDimensions(dto.getDimensions());
        variant.setUpdatedAt(Instant.now());

        if (dto.getQuantityOnHand() != null) {
            Inventory inventory = variant.getInventory();
            if (inventory == null) {
                inventory = new Inventory();
                inventory.setVariant(variant);
                inventory.setQuantityReserved(0);
                variant.setInventory(inventory);
            }
            inventory.setQuantityOnHand(dto.getQuantityOnHand());
            inventory.setUpdatedAt(Instant.now());
        }

        log.info("Updated variant id={} for productId={}", variantId, productId);
        return productVariantMapper.toResponseDTO(productVariantRepository.saveAndFlush(variant));
    }

    @Override
    public void delete(Long productId, Long variantId) {
        ProductVariant variant = getOwnedVariant(productId, variantId);
        productVariantRepository.delete(variant);
        log.info("Deleted variant id={} for productId={}", variantId, productId);
    }

    private ProductVariant getOwnedVariant(Long productId, Long variantId) {
        ProductVariant variant = productVariantRepository.findById(variantId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy biến thể với id " + variantId));
        if (!variant.getProduct().getId().equals(productId)) {
            throw new ResourceNotFoundException("Biến thể " + variantId + " không thuộc sản phẩm " + productId);
        }
        return variant;
    }
}
