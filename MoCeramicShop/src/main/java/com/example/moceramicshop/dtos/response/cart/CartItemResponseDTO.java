package com.example.moceramicshop.dtos.response.cart;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class CartItemResponseDTO {
    private Long id;
    private Long variantId;
    private Long productId;
    private String productName;
    private String variantSnapshot;
    private String imageUrl;
    private BigDecimal currentPrice;
    private BigDecimal priceAtAdd;
    private Integer quantity;
    private BigDecimal lineTotal;
}
