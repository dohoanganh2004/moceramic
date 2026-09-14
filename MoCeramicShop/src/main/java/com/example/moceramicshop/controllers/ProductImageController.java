package com.example.moceramicshop.controllers;

import com.example.moceramicshop.dtos.response.product.ProductImageResponseDTO;
import com.example.moceramicshop.security.CustomUserDetails;
import com.example.moceramicshop.security.PermissionGuard;
import com.example.moceramicshop.services.ProductImageService;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/products/{productId}/images")
public class ProductImageController {

    private final ProductImageService productImageService;
    private final PermissionGuard permissionGuard;

    public ProductImageController(ProductImageService productImageService, PermissionGuard permissionGuard) {
        this.productImageService = productImageService;
        this.permissionGuard = permissionGuard;
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ProductImageResponseDTO> add(@PathVariable Long productId,
                                                         @RequestPart("file") MultipartFile file,
                                                         @RequestParam(value = "isPrimary", required = false, defaultValue = "false") Boolean isPrimary,
                                                         @AuthenticationPrincipal CustomUserDetails currentUser) {
        permissionGuard.require(currentUser, "products");
        return ResponseEntity.status(HttpStatus.CREATED).body(productImageService.addImage(productId, file, isPrimary));
    }

    @DeleteMapping("/{imageId}")
    public ResponseEntity<Void> delete(@PathVariable Long productId, @PathVariable Long imageId,
                                        @AuthenticationPrincipal CustomUserDetails currentUser) {
        permissionGuard.require(currentUser, "products");
        productImageService.deleteImage(productId, imageId);
        return ResponseEntity.noContent().build();
    }
}
