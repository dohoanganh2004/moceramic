package com.example.moceramicshop.mappers;

import com.example.moceramicshop.dtos.response.wishlist.WishlistResponseDTO;
import com.example.moceramicshop.models.Product;
import com.example.moceramicshop.models.ProductImage;
import com.example.moceramicshop.models.Wishlist;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.math.BigDecimal;
import java.util.List;

@Mapper(componentModel = "spring")
public interface WishlistMapper {

    @Mapping(target = "productId", source = "product.id")
    @Mapping(target = "productName", source = "product.name")
    @Mapping(target = "productSlug", source = "product.slug")
    @Mapping(target = "basePrice", source = "product.basePrice")
    @Mapping(target = "displayPrice", expression = "java(resolveDisplayPrice(wishlist.getProduct()))")
    @Mapping(target = "productImageUrl", expression = "java(resolveImageUrl(wishlist.getProduct()))")
    WishlistResponseDTO toResponseDTO(Wishlist wishlist);

    // Same "default variant" as ProductMapper/the frontend's getDisplayPrice()
    // use elsewhere: the first variant's price, falling back to basePrice for
    // products with no variants.
    default BigDecimal resolveDisplayPrice(Product product) {
        if (product.getVariants() != null && !product.getVariants().isEmpty()) {
            BigDecimal variantPrice = product.getVariants().get(0).getPrice();
            if (variantPrice != null) {
                return variantPrice;
            }
        }
        return product.getBasePrice();
    }

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
