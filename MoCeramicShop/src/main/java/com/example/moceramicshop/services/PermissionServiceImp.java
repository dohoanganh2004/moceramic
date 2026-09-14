package com.example.moceramicshop.services;

import com.example.moceramicshop.dtos.request.permission.CreatePermissionRequestDTO;
import com.example.moceramicshop.dtos.request.permission.UpdateRolePermissionsRequestDTO;
import com.example.moceramicshop.dtos.response.permission.PermissionResponseDTO;
import com.example.moceramicshop.dtos.response.permission.RoleResponseDTO;
import com.example.moceramicshop.exceptions.BadRequestException;
import com.example.moceramicshop.exceptions.ConflictException;
import com.example.moceramicshop.exceptions.ResourceNotFoundException;
import com.example.moceramicshop.models.Permission;
import com.example.moceramicshop.models.Role;
import com.example.moceramicshop.models.RolePermission;
import com.example.moceramicshop.repositories.PermissionRepository;
import com.example.moceramicshop.repositories.RolePermissionRepository;
import com.example.moceramicshop.repositories.RoleRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class PermissionServiceImp implements PermissionService {

    private final PermissionRepository permissionRepository;
    private final RoleRepository roleRepository;
    private final RolePermissionRepository rolePermissionRepository;

    public PermissionServiceImp(PermissionRepository permissionRepository, RoleRepository roleRepository,
                                 RolePermissionRepository rolePermissionRepository) {
        this.permissionRepository = permissionRepository;
        this.roleRepository = roleRepository;
        this.rolePermissionRepository = rolePermissionRepository;
    }

    @Override
    public List<PermissionResponseDTO> getAllPermissions() {
        return permissionRepository.findAllByOrderByIdAsc().stream()
                .map(p -> new PermissionResponseDTO(p.getId(), p.getCode(), p.getDescription()))
                .toList();
    }

    @Override
    public List<RoleResponseDTO> getAllRoles() {
        return roleRepository.findAll().stream()
                .map(r -> new RoleResponseDTO(r.getId(), r.getName(), r.getDescription()))
                .toList();
    }

    @Override
    public List<Integer> getPermissionIdsForRole(Integer roleId) {
        return rolePermissionRepository.findByRoleId(roleId).stream()
                .map(rp -> rp.getPermission().getId())
                .toList();
    }

    @Override
    public List<String> getPermissionCodesForRole(Integer roleId) {
        return rolePermissionRepository.findByRoleId(roleId).stream()
                .map(rp -> rp.getPermission().getCode())
                .toList();
    }

    @Override
    public boolean hasPermission(Integer roleId, String code) {
        return rolePermissionRepository.findByRoleId(roleId).stream()
                .anyMatch(rp -> rp.getPermission().getCode().equals(code));
    }

    @Override
    @Transactional
    public void updateRolePermissions(Integer roleId, UpdateRolePermissionsRequestDTO dto) {
        Role role = roleRepository.findById(roleId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy role với id " + roleId));
        if ("admin".equals(role.getName())) {
            throw new BadRequestException("Không thể chỉnh sửa quyền của role admin");
        }

        List<Integer> permissionIds = dto.getPermissionIds();
        List<Permission> permissions = permissionRepository.findAllById(permissionIds);
        if (permissions.size() != permissionIds.size()) {
            throw new BadRequestException("Danh sách permission có id không hợp lệ");
        }

        rolePermissionRepository.deleteByRoleId(roleId);
        rolePermissionRepository.flush();
        List<RolePermission> rolePermissions = permissions.stream().map(permission -> {
            RolePermission rp = new RolePermission();
            rp.setRole(role);
            rp.setPermission(permission);
            return rp;
        }).toList();
        rolePermissionRepository.saveAll(rolePermissions);
    }

    @Override
    public PermissionResponseDTO createPermission(CreatePermissionRequestDTO dto) {
        String code = dto.getCode().trim();
        if (permissionRepository.findByCode(code).isPresent()) {
            throw new ConflictException("Permission với code '" + code + "' đã tồn tại");
        }
        Permission permission = new Permission();
        permission.setCode(code);
        permission.setDescription(dto.getDescription());
        Permission saved = permissionRepository.save(permission);
        return new PermissionResponseDTO(saved.getId(), saved.getCode(), saved.getDescription());
    }

    @Override
    @Transactional
    public void deletePermission(Integer permissionId) {
        if (!permissionRepository.existsById(permissionId)) {
            throw new ResourceNotFoundException("Không tìm thấy permission với id " + permissionId);
        }
        permissionRepository.deleteById(permissionId);
    }
}
