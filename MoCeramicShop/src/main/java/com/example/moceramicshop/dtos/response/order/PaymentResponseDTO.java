package com.example.moceramicshop.dtos.response.order;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.Instant;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class PaymentResponseDTO {
    private Long id;
    private String method;
    private BigDecimal amount;
    private String status;
    private String transactionRef;
    private Instant paidAt;
    private Instant createdAt;
}
