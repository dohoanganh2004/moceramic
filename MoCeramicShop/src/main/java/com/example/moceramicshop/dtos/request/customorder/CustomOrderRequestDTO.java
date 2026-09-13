package com.example.moceramicshop.dtos.request.customorder;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.time.LocalDate;

@Data
public class CustomOrderRequestDTO {
    @NotBlank(message = "Contact name is required")
    @Size(max = 150, message = "Contact name must be at most 150 characters")
    private String contactName;

    @NotBlank(message = "Contact email is required")
    @Email(message = "Contact email must be valid")
    @Size(max = 150, message = "Contact email must be at most 150 characters")
    private String contactEmail;

    @NotBlank(message = "Contact phone is required")
    @Size(max = 20, message = "Contact phone must be at most 20 characters")
    private String contactPhone;

    @NotBlank(message = "Description is required")
    private String description;

    @NotNull(message = "Quantity is required")
    @Positive(message = "Quantity must be greater than 0")
    private Integer quantity;

    private LocalDate desiredCompletionDate;
}
