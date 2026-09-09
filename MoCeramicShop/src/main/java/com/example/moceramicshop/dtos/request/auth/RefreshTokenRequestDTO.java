package com.example.moceramicshop.dtos.request.auth;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.io.Serializable;

@Data
public class RefreshTokenRequestDTO implements Serializable {
    @NotBlank(message = "Refresh token is required")
    private String refreshToken;
}
