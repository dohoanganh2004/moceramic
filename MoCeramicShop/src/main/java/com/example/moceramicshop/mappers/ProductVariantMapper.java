package com.example.moceramicshop.mappers;

import com.example.moceramicshop.dtos.response.product.ProductVariantResponseDTO;
import com.example.moceramicshop.models.ProductVariant;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface ProductVariantMapper {
    @Mapping(target = "quantityOnHand", expression = "java(variant.getInventory() != null ? variant.getInventory().getQuantityOnHand() : 0)")
    @Mapping(target = "quantityReserved", expression = "java(variant.getInventory() != null ? variant.getInventory().getQuantityReserved() : 0)")
    ProductVariantResponseDTO toResponseDTO(ProductVariant variant);
}
