package com.example.moceramicshop.dtos.request.product;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class ProductVariantRequestDTO {
    @NotBlank(message = "SKU is required")
    @Size(max = 80, message = "SKU must be at most 80 characters")
    private String sku;

    @Size(max = 100, message = "Color/glaze must be at most 100 characters")
    private String colorGlaze;

    @Size(max = 50, message = "Size must be at most 50 characters")
    private String size;

    @NotNull(message = "Price is required")
    @DecimalMin(value = "0.0", inclusive = false, message = "Price must be greater than 0")
    private BigDecimal price;

    @Positive(message = "Weight must be greater than 0")
    private Integer weightGrams;

    @Size(max = 100, message = "Dimensions must be at most 100 characters")
    private String dimensions;
}
