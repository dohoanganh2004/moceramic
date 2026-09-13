package com.example.moceramicshop.dtos.request.order;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

import java.util.List;

@Data
public class OrderCreateRequestDTO {
    @NotNull(message = "Shipping address is required")
    private Long shippingAddressId;

    private String voucherCode;

    private String note;

    @Pattern(
            regexp = "^(cod|bank_transfer|vnpay|momo|stripe)$",
            message = "Payment method must be one of: cod, bank_transfer, vnpay, momo, stripe"
    )
    private String paymentMethod;

    @NotEmpty(message = "Order must have at least one item")
    @Valid
    private List<OrderItemRequestDTO> items;
}
