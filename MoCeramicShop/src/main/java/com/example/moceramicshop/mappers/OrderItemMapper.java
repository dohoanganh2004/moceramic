package com.example.moceramicshop.mappers;

import com.example.moceramicshop.dtos.response.order.OrderItemResponseDTO;
import com.example.moceramicshop.models.OrderItem;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface OrderItemMapper {
    @Mapping(target = "variantId", source = "variant.id")
    OrderItemResponseDTO toResponseDTO(OrderItem item);
}
