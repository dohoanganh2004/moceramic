package com.example.moceramicshop.dtos.response.product;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ProductVariantResponseDTO {
    private Long id;
    private String sku;
    private String colorGlaze;
    private String size;
    private BigDecimal price;
    private Integer weightGrams;
    private String dimensions;
    private Integer quantityOnHand;
    private Integer quantityReserved;
}
