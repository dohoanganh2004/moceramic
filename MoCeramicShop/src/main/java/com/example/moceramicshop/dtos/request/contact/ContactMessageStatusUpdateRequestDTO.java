package com.example.moceramicshop.dtos.request.contact;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

@Data
public class ContactMessageStatusUpdateRequestDTO {
    @NotBlank(message = "Status is required")
    @Pattern(regexp = "^(new|read|replied|closed)$", message = "Status must be one of: new, read, replied, closed")
    private String status;
}
