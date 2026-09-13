package com.example.moceramicshop.dtos.request.voucher;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.math.BigDecimal;
import java.time.Instant;

@Data
public class VoucherRequestDTO {
    @NotBlank(message = "Code is required")
    @Size(max = 50, message = "Code must be at most 50 characters")
    @Pattern(regexp = "^[A-Z0-9_-]+$", message = "Code must be uppercase letters, numbers, underscores or hyphens only")
    private String code;

    private String description;

    @NotBlank(message = "Discount type is required")
    @Pattern(regexp = "^(percentage|fixed)$", message = "Discount type must be 'percentage' or 'fixed'")
    private String discountType;

    @NotNull(message = "Discount value is required")
    @DecimalMin(value = "0.0", inclusive = false, message = "Discount value must be greater than 0")
    private BigDecimal discountValue;

    @DecimalMin(value = "0.0", message = "Min order amount must be at least 0")
    private BigDecimal minOrderAmount;

    @DecimalMin(value = "0.0", inclusive = false, message = "Max discount amount must be greater than 0")
    private BigDecimal maxDiscountAmount;

    private Instant startDate;

    private Instant endDate;

    @Positive(message = "Usage limit must be greater than 0")
    private Integer usageLimit;

    private Boolean isActive;
}
