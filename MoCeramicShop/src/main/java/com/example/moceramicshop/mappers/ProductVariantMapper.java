package com.example.moceramicshop.mappers;

import com.example.moceramicshop.dtos.response.product.ProductVariantResponseDTO;
import com.example.moceramicshop.models.ProductVariant;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface ProductVariantMapper {
    ProductVariantResponseDTO toResponseDTO(ProductVariant variant);
}
