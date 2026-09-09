package com.example.moceramicshop.dtos.response.product;

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
public class ProductResponseDTO {
    private Long id;
    private Long categoryId;
    private String categoryName;
    private String name;
    private String slug;
    private String description;
    private String careInstructions;
    private String material;
    private String origin;
    private BigDecimal basePrice;
    private String status;
    private List<ProductImageResponseDTO> images;
    private List<ProductVariantResponseDTO> variants;
    private Instant createdAt;
    private Instant updatedAt;
}
