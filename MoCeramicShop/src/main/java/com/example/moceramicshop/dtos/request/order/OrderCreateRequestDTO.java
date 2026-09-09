package com.example.moceramicshop.dtos.request.order;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.List;

@Data
public class OrderCreateRequestDTO {
    @NotNull(message = "Shipping address is required")
    private Long shippingAddressId;

    private String voucherCode;

    private String note;

    @NotEmpty(message = "Order must have at least one item")
    @Valid
    private List<OrderItemRequestDTO> items;
}
