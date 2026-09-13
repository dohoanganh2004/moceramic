package com.example.moceramicshop.mappers;

import com.example.moceramicshop.dtos.response.cart.CartResponseDTO;
import com.example.moceramicshop.models.Cart;
import com.example.moceramicshop.models.CartItem;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.math.BigDecimal;

@Mapper(componentModel = "spring", uses = {CartItemMapper.class})
public interface CartMapper {

    @Mapping(target = "totalItems", expression = "java(cart.getItems().stream().mapToInt(CartItem::getQuantity).sum())")
    @Mapping(target = "totalAmount", expression = "java(computeTotalAmount(cart))")
    CartResponseDTO toResponseDTO(Cart cart);

    default BigDecimal computeTotalAmount(Cart cart) {
        return cart.getItems().stream()
                .map(item -> item.getVariant().getPrice().multiply(BigDecimal.valueOf(item.getQuantity())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }
}
