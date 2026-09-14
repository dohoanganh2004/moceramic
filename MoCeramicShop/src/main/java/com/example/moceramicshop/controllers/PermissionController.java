package com.example.moceramicshop.controllers;

import com.example.moceramicshop.dtos.request.permission.CreatePermissionRequestDTO;
import com.example.moceramicshop.dtos.request.permission.UpdateRolePermissionsRequestDTO;
import com.example.moceramicshop.dtos.response.permission.PermissionResponseDTO;
import com.example.moceramicshop.dtos.response.permission.RoleResponseDTO;
import com.example.moceramicshop.exceptions.ForbiddenException;
import com.example.moceramicshop.security.CustomUserDetails;
import com.example.moceramicshop.services.PermissionService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api")
public class PermissionController {

    private final PermissionService permissionService;

    public PermissionController(PermissionService permissionService) {
        this.permissionService = permissionService;
    }

    private void requireAdmin(CustomUserDetails currentUser) {
        boolean isAdmin = "admin".equals(currentUser.getUser().getRole().getName());
        if (!isAdmin) {
            throw new ForbiddenException("Chỉ admin mới có quyền quản lý phân quyền");
        }
    }

    @GetMapping("/permissions")
    public ResponseEntity<List<PermissionResponseDTO>> getAllPermissions(@AuthenticationPrincipal CustomUserDetails currentUser) {
        requireAdmin(currentUser);
        return ResponseEntity.ok(permissionService.getAllPermissions());
    }

    @PostMapping("/permissions")
    public ResponseEntity<PermissionResponseDTO> createPermission(@Valid @RequestBody CreatePermissionRequestDTO dto,
                                                                    @AuthenticationPrincipal CustomUserDetails currentUser) {
        requireAdmin(currentUser);
        return ResponseEntity.status(HttpStatus.CREATED).body(permissionService.createPermission(dto));
    }

    @DeleteMapping("/permissions/{permissionId}")
    public ResponseEntity<Void> deletePermission(@PathVariable Integer permissionId,
                                                  @AuthenticationPrincipal CustomUserDetails currentUser) {
        requireAdmin(currentUser);
        permissionService.deletePermission(permissionId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/roles")
    public ResponseEntity<List<RoleResponseDTO>> getAllRoles(@AuthenticationPrincipal CustomUserDetails currentUser) {
        requireAdmin(currentUser);
        return ResponseEntity.ok(permissionService.getAllRoles());
    }

    @GetMapping("/roles/{roleId}/permissions")
    public ResponseEntity<List<Integer>> getRolePermissions(@PathVariable Integer roleId,
                                                              @AuthenticationPrincipal CustomUserDetails currentUser) {
        requireAdmin(currentUser);
        return ResponseEntity.ok(permissionService.getPermissionIdsForRole(roleId));
    }

    @PutMapping("/roles/{roleId}/permissions")
    public ResponseEntity<Void> updateRolePermissions(@PathVariable Integer roleId,
                                                        @Valid @RequestBody UpdateRolePermissionsRequestDTO dto,
                                                        @AuthenticationPrincipal CustomUserDetails currentUser) {
        requireAdmin(currentUser);
        permissionService.updateRolePermissions(roleId, dto);
        return ResponseEntity.noContent().build();
    }
}
