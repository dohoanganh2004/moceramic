package com.example.moceramicshop.mappers;

import com.example.moceramicshop.dtos.response.product.ProductResponseDTO;
import com.example.moceramicshop.models.Product;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring", uses = {ProductImageMapper.class, ProductVariantMapper.class})
public interface ProductMapper {
    @Mapping(target = "categoryId", source = "category.id")
    @Mapping(target = "categoryName", source = "category.name")
    ProductResponseDTO toResponseDTO(Product product);
}
