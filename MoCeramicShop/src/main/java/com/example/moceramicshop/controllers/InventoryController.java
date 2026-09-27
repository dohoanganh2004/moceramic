package com.example.moceramicshop.controllers;

import com.example.moceramicshop.dtos.request.inventory.InventoryAdjustRequestDTO;
import com.example.moceramicshop.dtos.response.inventory.InventoryResponseDTO;
import com.example.moceramicshop.security.CustomUserDetails;
import com.example.moceramicshop.security.PermissionGuard;
import com.example.moceramicshop.services.InventoryService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/inventory")
public class InventoryController {

    private final InventoryService inventoryService;
    private final PermissionGuard permissionGuard;

    public InventoryController(InventoryService inventoryService, PermissionGuard permissionGuard) {
        this.inventoryService = inventoryService;
        this.permissionGuard = permissionGuard;
    }

    @GetMapping("/search")
    public ResponseEntity<Page<InventoryResponseDTO>> search(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Integer lowStockAtMost,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @AuthenticationPrincipal CustomUserDetails currentUser) {
        permissionGuard.require(currentUser, "inventory");
        Pageable pageable = PageRequest.of(Math.max(page, 0), Math.min(Math.max(size, 1), 100),
                Sort.by("variant.product.name").ascending());
        return ResponseEntity.ok(inventoryService.search(search, lowStockAtMost, pageable));
    }

    @PatchMapping("/{inventoryId}")
    public ResponseEntity<InventoryResponseDTO> adjust(@PathVariable Long inventoryId,
                                                          @Valid @RequestBody InventoryAdjustRequestDTO dto,
                                                          @AuthenticationPrincipal CustomUserDetails currentUser) {
        permissionGuard.require(currentUser, "inventory");
        return ResponseEntity.ok(inventoryService.adjust(inventoryId, dto));
    }
}
