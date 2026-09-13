package com.example.moceramicshop.mappers;

import com.example.moceramicshop.dtos.response.cart.CartItemResponseDTO;
import com.example.moceramicshop.models.CartItem;
import com.example.moceramicshop.models.ProductImage;
import com.example.moceramicshop.models.ProductVariant;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(componentModel = "spring")
public interface CartItemMapper {

    @Mapping(target = "variantId", source = "variant.id")
    @Mapping(target = "productId", source = "variant.product.id")
    @Mapping(target = "productName", source = "variant.product.name")
    @Mapping(target = "currentPrice", source = "variant.price")
    @Mapping(target = "variantSnapshot", expression = "java(buildVariantSnapshot(item.getVariant()))")
    @Mapping(target = "imageUrl", expression = "java(resolveImageUrl(item.getVariant()))")
    @Mapping(target = "lineTotal", expression = "java(item.getVariant().getPrice().multiply(java.math.BigDecimal.valueOf(item.getQuantity())))")
    CartItemResponseDTO toResponseDTO(CartItem item);

    default String buildVariantSnapshot(ProductVariant variant) {
        StringBuilder sb = new StringBuilder();
        if (variant.getColorGlaze() != null) {
            sb.append(variant.getColorGlaze());
        }
        if (variant.getSize() != null) {
            if (sb.length() > 0) sb.append(" - ");
            sb.append(variant.getSize());
        }
        return sb.isEmpty() ? null : sb.toString();
    }

    default String resolveImageUrl(ProductVariant variant) {
        List<ProductImage> images = variant.getProduct().getImages();
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
