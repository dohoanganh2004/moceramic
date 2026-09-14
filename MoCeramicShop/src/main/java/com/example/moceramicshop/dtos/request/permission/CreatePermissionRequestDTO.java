package com.example.moceramicshop.dtos.request.permission;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CreatePermissionRequestDTO {
    @NotBlank(message = "code is required")
    private String code;

    private String description;
}
