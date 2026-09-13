package com.example.moceramicshop.services;

import com.example.moceramicshop.dtos.request.cart.CartItemRequestDTO;
import com.example.moceramicshop.dtos.request.cart.CartItemUpdateRequestDTO;
import com.example.moceramicshop.dtos.response.cart.CartResponseDTO;

public interface CartService {
    CartResponseDTO findByCustomerId(Long customerId);

    CartResponseDTO addItem(Long customerId, CartItemRequestDTO request);

    CartResponseDTO updateItem(Long customerId, Long cartItemId, CartItemUpdateRequestDTO request);
    void removeItem(Long customerId, Long cartItemId);
}
