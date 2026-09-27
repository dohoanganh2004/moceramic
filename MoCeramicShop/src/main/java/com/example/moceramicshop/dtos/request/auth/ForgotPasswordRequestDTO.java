package com.example.moceramicshop.dtos.request.auth;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.io.Serializable;

@Data
public class ForgotPasswordRequestDTO implements Serializable {
    @NotBlank(message = "Email is required")
    @Email(message = "Email must be valid")
    private String email;
}
