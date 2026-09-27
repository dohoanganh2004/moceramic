package com.example.moceramicshop.dtos.response.wishlist;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.Instant;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class WishlistResponseDTO {
    private Long id;
    private Long productId;
    private String productName;
    private String productSlug;
    private String productImageUrl;
    private BigDecimal basePrice;
    // Price of the product's default (first) variant, falling back to
    // basePrice for products with no variants - this is what "Add to Cart"
    // from a listing actually charges, so it's what should be displayed.
    private BigDecimal displayPrice;
    private Instant createdAt;
}
