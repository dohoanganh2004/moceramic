package com.example.moceramicshop.dtos.request.user;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.io.Serializable;

@Data
public class CreateUserRequestDTO implements Serializable {
    @NotBlank(message = "Full name is required")
    private String fullName;

    @NotBlank(message = "Email is required")
    @Email(message = "Email must be valid")
    private String email;

    private String phone;

    @NotBlank(message = "Password is required")
    private String password;

    private String oauthProvider;

    private String avatarUrl;

    @NotNull(message = "Role is required")
    private Integer roleId;

    private Boolean isActive;
}
