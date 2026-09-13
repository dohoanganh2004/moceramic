package com.example.moceramicshop.services;

import com.example.moceramicshop.dtos.request.wishlist.WishlistRequestDTO;
import com.example.moceramicshop.dtos.response.wishlist.WishlistResponseDTO;

import java.util.List;

public interface WishlistService {
    List<WishlistResponseDTO> getMyWishlist(Long customerId);

    WishlistResponseDTO addToWishlist(Long customerId, WishlistRequestDTO request);

    void removeFromWishlist(Long customerId, Long productId);
}
