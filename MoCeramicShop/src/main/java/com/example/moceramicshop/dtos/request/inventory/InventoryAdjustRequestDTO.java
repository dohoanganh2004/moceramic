package com.example.moceramicshop.dtos.request.inventory;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class InventoryAdjustRequestDTO {
    @NotNull(message = "Quantity on hand is required")
    @Min(value = 0, message = "Quantity on hand cannot be negative")
    private Integer quantityOnHand;
}
