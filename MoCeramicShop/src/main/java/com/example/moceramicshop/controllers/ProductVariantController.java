package com.example.moceramicshop.controllers;

import com.example.moceramicshop.dtos.request.product.ProductVariantRequestDTO;
import com.example.moceramicshop.dtos.response.product.ProductVariantResponseDTO;
import com.example.moceramicshop.security.CustomUserDetails;
import com.example.moceramicshop.security.PermissionGuard;
import com.example.moceramicshop.services.ProductVariantService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/products/{productId}/variants")
public class ProductVariantController {

    private final ProductVariantService productVariantService;
    private final PermissionGuard permissionGuard;

    public ProductVariantController(ProductVariantService productVariantService, PermissionGuard permissionGuard) {
        this.productVariantService = productVariantService;
        this.permissionGuard = permissionGuard;
    }

    @PutMapping("/{variantId}")
    public ResponseEntity<ProductVariantResponseDTO> update(@PathVariable Long productId,
                                                              @PathVariable Long variantId,
                                                              @Valid @RequestBody ProductVariantRequestDTO dto,
                                                              @AuthenticationPrincipal CustomUserDetails currentUser) {
        permissionGuard.require(currentUser, "products");
        return ResponseEntity.ok(productVariantService.update(productId, variantId, dto));
    }

    @DeleteMapping("/{variantId}")
    public ResponseEntity<Void> delete(@PathVariable Long productId, @PathVariable Long variantId,
                                        @AuthenticationPrincipal CustomUserDetails currentUser) {
        permissionGuard.require(currentUser, "products");
        productVariantService.delete(productId, variantId);
        return ResponseEntity.noContent().build();
    }
}
