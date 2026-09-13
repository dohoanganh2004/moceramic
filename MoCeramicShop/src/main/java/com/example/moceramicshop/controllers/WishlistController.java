package com.example.moceramicshop.controllers;

import com.example.moceramicshop.dtos.request.wishlist.WishlistRequestDTO;
import com.example.moceramicshop.dtos.response.wishlist.WishlistResponseDTO;
import com.example.moceramicshop.security.CustomUserDetails;
import com.example.moceramicshop.services.WishlistService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/wishlist")
public class WishlistController {

    private final WishlistService wishlistService;

    public WishlistController(WishlistService wishlistService) {
        this.wishlistService = wishlistService;
    }

    @GetMapping
    public ResponseEntity<List<WishlistResponseDTO>> getMyWishlist(@AuthenticationPrincipal CustomUserDetails currentUser) {
        return ResponseEntity.ok(wishlistService.getMyWishlist(currentUser.getUser().getId()));
    }

    @PostMapping
    public ResponseEntity<WishlistResponseDTO> add(@Valid @RequestBody WishlistRequestDTO dto,
                                                     @AuthenticationPrincipal CustomUserDetails currentUser) {
        return ResponseEntity.status(HttpStatus.CREATED).body(wishlistService.addToWishlist(currentUser.getUser().getId(), dto));
    }

    @DeleteMapping("/{productId}")
    public ResponseEntity<Void> remove(@PathVariable Long productId, @AuthenticationPrincipal CustomUserDetails currentUser) {
        wishlistService.removeFromWishlist(currentUser.getUser().getId(), productId);
        return ResponseEntity.noContent().build();
    }
}
