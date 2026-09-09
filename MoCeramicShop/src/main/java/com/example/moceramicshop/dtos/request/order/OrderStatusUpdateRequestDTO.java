package com.example.moceramicshop.dtos.request.order;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

@Data
public class OrderStatusUpdateRequestDTO {
    @NotBlank(message = "Status is required")
    @Pattern(
            regexp = "^(pending|confirmed|processing|shipping|delivered|cancelled)$",
            message = "Status must be one of: pending, confirmed, processing, shipping, delivered, cancelled"
    )
    private String status;

    private String note;
}
