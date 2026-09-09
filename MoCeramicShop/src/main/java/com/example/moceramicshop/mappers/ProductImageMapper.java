package com.example.moceramicshop.mappers;

import com.example.moceramicshop.dtos.response.product.ProductImageResponseDTO;
import com.example.moceramicshop.models.ProductImage;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface ProductImageMapper {
    ProductImageResponseDTO toResponseDTO(ProductImage image);
}
