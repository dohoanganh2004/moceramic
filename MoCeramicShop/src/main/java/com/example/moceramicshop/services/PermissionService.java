package com.example.moceramicshop.services;

import com.example.moceramicshop.dtos.request.permission.CreatePermissionRequestDTO;
import com.example.moceramicshop.dtos.request.permission.UpdateRolePermissionsRequestDTO;
import com.example.moceramicshop.dtos.response.permission.PermissionResponseDTO;
import com.example.moceramicshop.dtos.response.permission.RoleResponseDTO;

import java.util.List;

public interface PermissionService {
    List<PermissionResponseDTO> getAllPermissions();

    List<RoleResponseDTO> getAllRoles();

    List<Integer> getPermissionIdsForRole(Integer roleId);

    List<String> getPermissionCodesForRole(Integer roleId);

    boolean hasPermission(Integer roleId, String code);

    void updateRolePermissions(Integer roleId, UpdateRolePermissionsRequestDTO dto);

    PermissionResponseDTO createPermission(CreatePermissionRequestDTO dto);

    void deletePermission(Integer permissionId);
}
