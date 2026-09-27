package com.example.moceramicshop.dtos.response.inventory;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class InventoryResponseDTO {
    private Long id;
    private Long variantId;
    private String sku;
    private String colorGlaze;
    private String size;
    private Long productId;
    private String productName;
    private String productImageUrl;
    private Integer quantityOnHand;
    private Integer quantityReserved;
    private Integer quantityAvailable;
    private Instant updatedAt;
}
