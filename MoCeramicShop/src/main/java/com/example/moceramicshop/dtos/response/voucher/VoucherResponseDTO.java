package com.example.moceramicshop.dtos.response.voucher;

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
public class VoucherResponseDTO {
    private Long id;
    private String code;
    private String description;
    private String discountType;
    private BigDecimal discountValue;
    private BigDecimal minOrderAmount;
    private BigDecimal maxDiscountAmount;
    private Instant startDate;
    private Instant endDate;
    private Integer usageLimit;
    private Integer usedCount;
    private Boolean isActive;
    private Instant createdAt;
    private Instant updatedAt;
}
