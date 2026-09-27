package com.example.moceramicshop.mappers;

import com.example.moceramicshop.dtos.response.inventory.InventoryResponseDTO;
import com.example.moceramicshop.models.Inventory;
import com.example.moceramicshop.models.Product;
import com.example.moceramicshop.models.ProductImage;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(componentModel = "spring")
public interface InventoryMapper {

    @Mapping(target = "variantId", source = "variant.id")
    @Mapping(target = "sku", source = "variant.sku")
    @Mapping(target = "colorGlaze", source = "variant.colorGlaze")
    @Mapping(target = "size", source = "variant.size")
    @Mapping(target = "productId", source = "variant.product.id")
    @Mapping(target = "productName", source = "variant.product.name")
    @Mapping(target = "productImageUrl", expression = "java(resolveImageUrl(inventory.getVariant().getProduct()))")
    @Mapping(target = "quantityAvailable", expression = "java(Math.max(0, inventory.getQuantityOnHand() - inventory.getQuantityReserved()))")
    InventoryResponseDTO toResponseDTO(Inventory inventory);

    default String resolveImageUrl(Product product) {
        List<ProductImage> images = product.getImages();
        if (images == null || images.isEmpty()) {
            return null;
        }
        return images.stream()
                .filter(img -> Boolean.TRUE.equals(img.getIsPrimary()))
                .findFirst()
                .orElse(images.get(0))
                .getImageUrl();
    }
}
