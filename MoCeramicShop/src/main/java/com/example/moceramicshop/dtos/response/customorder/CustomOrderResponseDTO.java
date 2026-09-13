package com.example.moceramicshop.dtos.response.customorder;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class CustomOrderResponseDTO {
    private Long id;
    private Long userId;
    private String userName;
    private String contactName;
    private String contactEmail;
    private String contactPhone;
    private String description;
    private Integer quantity;
    private LocalDate desiredCompletionDate;
    private String status;
    private BigDecimal quotedPrice;
    private String adminNote;
    private List<String> attachmentUrls;
    private Instant createdAt;
    private Instant updatedAt;
}
