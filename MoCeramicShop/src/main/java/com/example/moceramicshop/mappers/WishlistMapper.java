package com.example.moceramicshop.mappers;

import com.example.moceramicshop.dtos.response.wishlist.WishlistResponseDTO;
import com.example.moceramicshop.models.Product;
import com.example.moceramicshop.models.ProductImage;
import com.example.moceramicshop.models.Wishlist;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(componentModel = "spring")
public interface WishlistMapper {

    @Mapping(target = "productId", source = "product.id")
    @Mapping(target = "productName", source = "product.name")
    @Mapping(target = "productSlug", source = "product.slug")
    @Mapping(target = "basePrice", source = "product.basePrice")
    @Mapping(target = "productImageUrl", expression = "java(resolveImageUrl(wishlist.getProduct()))")
    WishlistResponseDTO toResponseDTO(Wishlist wishlist);

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
