package com.example.moceramicshop.controllers;

import com.example.moceramicshop.dtos.request.cart.CartItemRequestDTO;
import com.example.moceramicshop.dtos.request.cart.CartItemUpdateRequestDTO;
import com.example.moceramicshop.dtos.response.cart.CartResponseDTO;
import com.example.moceramicshop.security.CustomUserDetails;
import com.example.moceramicshop.services.CartService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/cart")
public class CartController {

    private final CartService cartService;

    public CartController(CartService cartService) {
        this.cartService = cartService;
    }

    @GetMapping
    public ResponseEntity<CartResponseDTO> getMyCart(@AuthenticationPrincipal CustomUserDetails currentUser) {
        return ResponseEntity.ok(cartService.findByCustomerId(currentUser.getUser().getId()));
    }

    @PostMapping("/items")
    public ResponseEntity<CartResponseDTO> addItem(@Valid @RequestBody CartItemRequestDTO dto,
                                                     @AuthenticationPrincipal CustomUserDetails currentUser) {
        return ResponseEntity.ok(cartService.addItem(currentUser.getUser().getId(), dto));
    }

    @PatchMapping("/items/{cartItemId}")
    public ResponseEntity<CartResponseDTO> updateItem(@PathVariable Long cartItemId,
                                                        @Valid @RequestBody CartItemUpdateRequestDTO dto,
                                                        @AuthenticationPrincipal CustomUserDetails currentUser) {
        return ResponseEntity.ok(cartService.updateItem(currentUser.getUser().getId(), cartItemId, dto));
    }

    @DeleteMapping("/items/{cartItemId}")
    public ResponseEntity<Void> removeItem(@PathVariable Long cartItemId,
                                            @AuthenticationPrincipal CustomUserDetails currentUser) {
        cartService.removeItem(currentUser.getUser().getId(), cartItemId);
        return ResponseEntity.noContent().build();
    }
}
