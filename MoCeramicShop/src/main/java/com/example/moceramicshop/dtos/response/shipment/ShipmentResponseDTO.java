package com.example.moceramicshop.dtos.response.shipment;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ShipmentResponseDTO {
    private Long id;
    private Long orderId;
    private String orderCode;
    private String carrier;
    private String trackingCode;
    private String status;
    private BigDecimal shippingFee;
    private LocalDate estimatedDelivery;
    private Instant deliveredAt;
    private Instant createdAt;
    private Instant updatedAt;
}
