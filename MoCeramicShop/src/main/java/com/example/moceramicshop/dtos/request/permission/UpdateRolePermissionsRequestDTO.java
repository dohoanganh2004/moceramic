package com.example.moceramicshop.dtos.request.permission;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class UpdateRolePermissionsRequestDTO {
    @NotNull(message = "permissionIds is required")
    private List<Integer> permissionIds;
}
