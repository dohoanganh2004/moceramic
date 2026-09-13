package com.example.moceramicshop.dtos.request.payment;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class PaymentStatusUpdateRequestDTO {
    @NotBlank(message = "Status is required")
    @Pattern(
            regexp = "^(pending|paid|failed|refunded)$",
            message = "Status must be one of: pending, paid, failed, refunded"
    )
    private String status;

    @Size(max = 150, message = "Transaction ref must be at most 150 characters")
    private String transactionRef;
}
