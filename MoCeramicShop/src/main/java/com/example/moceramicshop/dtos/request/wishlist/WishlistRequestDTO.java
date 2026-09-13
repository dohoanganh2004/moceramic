package com.example.moceramicshop.dtos.request.wishlist;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class WishlistRequestDTO {
    @NotNull(message = "Product is required")
    private Long productId;
}
