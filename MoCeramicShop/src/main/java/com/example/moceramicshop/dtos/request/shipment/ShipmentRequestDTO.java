package com.example.moceramicshop.dtos.request.shipment;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class ShipmentRequestDTO {
    @NotNull(message = "Order is required")
    private Long orderId;

    @Size(max = 50, message = "Carrier must be at most 50 characters")
    private String carrier;

    @Size(max = 100, message = "Tracking code must be at most 100 characters")
    private String trackingCode;

    @Pattern(
            regexp = "^(pending|preparing|shipped|in_transit|delivered|returned|cancelled)$",
            message = "Status must be one of: pending, preparing, shipped, in_transit, delivered, returned, cancelled"
    )
    private String status;

    @DecimalMin(value = "0.0", message = "Shipping fee must be zero or greater")
    private BigDecimal shippingFee;

    private LocalDate estimatedDelivery;
}
