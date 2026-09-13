package com.example.moceramicshop.dtos.response.cart;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class CartResponseDTO {
    private Long id;
    private String status;
    private List<CartItemResponseDTO> items;
    private Integer totalItems;
    private BigDecimal totalAmount;
    private Instant updatedAt;
}
