package com.example.moceramicshop.dtos.request.customorder;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class CustomOrderAdminUpdateRequestDTO {
    @NotBlank(message = "Status is required")
    @Pattern(
            regexp = "^(requested|reviewing|quoted|accepted|in_progress|completed|cancelled)$",
            message = "Status must be one of: requested, reviewing, quoted, accepted, in_progress, completed, cancelled"
    )
    private String status;

    @DecimalMin(value = "0.0", inclusive = false, message = "Quoted price must be greater than 0")
    private BigDecimal quotedPrice;

    private String adminNote;
}
