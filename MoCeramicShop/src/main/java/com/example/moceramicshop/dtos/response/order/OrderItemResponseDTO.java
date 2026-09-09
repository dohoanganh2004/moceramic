package com.example.moceramicshop.dtos.response.order;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class OrderItemResponseDTO {
    private Long id;
    private Long variantId;
    private String productNameSnapshot;
    private String variantSnapshot;
    private BigDecimal unitPrice;
    private Integer quantity;
    private BigDecimal subtotal;
}
