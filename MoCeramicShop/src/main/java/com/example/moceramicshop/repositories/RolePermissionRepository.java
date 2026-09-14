package com.example.moceramicshop.repositories;

import com.example.moceramicshop.models.RolePermission;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

public interface RolePermissionRepository extends JpaRepository<RolePermission, Long> {
    List<RolePermission> findByRoleId(Integer roleId);

    @Transactional
    void deleteByRoleId(Integer roleId);

    List<RolePermission> findByRoleIdIn(List<Integer> roleIds);
}
