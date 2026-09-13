package com.example.moceramicshop.dtos.request.payment;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class PaymentRequestDTO {
    @NotNull(message = "Order is required")
    private Long orderId;

    @NotBlank(message = "Method is required")
    @Pattern(
            regexp = "^(cod|bank_transfer|vnpay|momo|stripe)$",
            message = "Method must be one of: cod, bank_transfer, vnpay, momo, stripe"
    )
    private String method;

    @NotNull(message = "Amount is required")
    @DecimalMin(value = "0.0", inclusive = false, message = "Amount must be greater than 0")
    private BigDecimal amount;

    @Pattern(
            regexp = "^(pending|paid|failed|refunded)$",
            message = "Status must be one of: pending, paid, failed, refunded"
    )
    private String status;

    @Size(max = 150, message = "Transaction ref must be at most 150 characters")
    private String transactionRef;
}
