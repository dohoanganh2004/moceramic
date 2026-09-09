package com.example.moceramicshop.dtos.response.order;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class OrderResponseDTO {
    private Long id;
    private String orderCode;
    private Long userId;
    private String userName;
    private String shippingSnapshot;
    private String status;
    private BigDecimal subtotal;
    private BigDecimal discountAmount;
    private BigDecimal shippingFee;
    private BigDecimal totalAmount;
    private String voucherCode;
    private String note;
    private List<OrderItemResponseDTO> items;
    private List<OrderStatusHistoryResponseDTO> statusHistory;
    private List<PaymentResponseDTO> payments;
    private Instant createdAt;
    private Instant updatedAt;
}
