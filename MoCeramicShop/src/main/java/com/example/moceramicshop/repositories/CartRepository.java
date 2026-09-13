package com.example.moceramicshop.repositories;

import com.example.moceramicshop.models.Cart;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface CartRepository extends JpaRepository<Cart, Long> {
    Optional<Cart> findByUser_IdAndStatus(Long userId, String status);

    Cart getCartsById(Long id);
}
