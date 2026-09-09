package com.example.moceramicshop.dtos.request.address;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.io.Serializable;

@Data
public class AddressRequestDTO implements Serializable {

    @NotBlank(message = "Recipient name is required")
    @Size(max = 150, message = "Recipient name must be at most 150 characters")
    private String recipientName;

    @NotBlank(message = "Phone is required")
    @Size(max = 20, message = "Phone must be at most 20 characters")
    private String phone;

    @NotBlank(message = "Address line is required")
    private String addressLine;

    @Size(max = 100, message = "Ward must be at most 100 characters")
    private String ward;

    @Size(max = 100, message = "District must be at most 100 characters")
    private String district;

    @NotBlank(message = "City is required")
    @Size(max = 100, message = "City must be at most 100 characters")
    private String city;

    @Size(max = 100, message = "Country must be at most 100 characters")
    private String country;
}
