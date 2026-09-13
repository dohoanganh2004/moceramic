package com.example.moceramicshop.repositories;

import com.example.moceramicshop.models.CartItem;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface CartItemRepository extends JpaRepository<CartItem, Long> {
    Optional<CartItem> findByCart_IdAndVariant_Id(Long cartId, Long variantId);

    CartItem getCartItemsById(Long id);
}
