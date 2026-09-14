package com.example.moceramicshop.repositories;

import com.example.moceramicshop.models.Permission;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface PermissionRepository extends JpaRepository<Permission, Integer> {
    List<Permission> findAllByOrderByIdAsc();

    Optional<Permission> findByCode(String code);
}
