package com.example.moceramicshop.dtos.response.order;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class OrderStatusHistoryResponseDTO {
    private Long id;
    private String status;
    private String note;
    private Long changedByUserId;
    private String changedByName;
    private Instant createdAt;
}
