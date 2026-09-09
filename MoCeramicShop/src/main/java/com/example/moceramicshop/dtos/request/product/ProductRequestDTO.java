package com.example.moceramicshop.dtos.request.product;

import jakarta.validation.Valid;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
public class ProductRequestDTO {
    @NotNull(message = "Category is required")
    private Long categoryId;

    @NotBlank(message = "Name is required")
    @Size(max = 200, message = "Name must be at most 200 characters")
    private String name;

    @NotBlank(message = "Slug is required")
    @Size(max = 220, message = "Slug must be at most 220 characters")
    @Pattern(regexp = "^[a-z0-9]+(-[a-z0-9]+)*$", message = "Slug must be lowercase letters, numbers and hyphens only")
    private String slug;

    private String description;

    private String careInstructions;

    @Size(max = 150, message = "Material must be at most 150 characters")
    private String material;

    @Size(max = 150, message = "Origin must be at most 150 characters")
    private String origin;

    @NotNull(message = "Base price is required")
    @DecimalMin(value = "0.0", inclusive = false, message = "Base price must be greater than 0")
    private BigDecimal basePrice;

    @Valid
    private List<ProductVariantRequestDTO> variants;
}
