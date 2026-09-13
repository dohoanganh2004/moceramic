package com.example.moceramicshop.repositories;

import com.example.moceramicshop.models.User;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long>, JpaSpecificationExecutor<User> {
    User getUserByPhone(String phone);

    User getUserByEmail(String email);

    @EntityGraph(attributePaths = "role")
    Optional<User> findWithRoleById(Long id);

    User getUserById(Long id);

    long countByRole_Name(String roleName);
}
