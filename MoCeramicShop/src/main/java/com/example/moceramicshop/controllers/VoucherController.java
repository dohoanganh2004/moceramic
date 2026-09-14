package com.example.moceramicshop.controllers;

import com.example.moceramicshop.dtos.request.voucher.VoucherRequestDTO;
import com.example.moceramicshop.dtos.response.voucher.VoucherResponseDTO;
import com.example.moceramicshop.security.CustomUserDetails;
import com.example.moceramicshop.security.PermissionGuard;
import com.example.moceramicshop.services.VoucherService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Set;

@RestController
@RequestMapping("/api/vouchers")
public class VoucherController {

    private final VoucherService voucherService;
    private final PermissionGuard permissionGuard;

    public VoucherController(VoucherService voucherService, PermissionGuard permissionGuard) {
        this.voucherService = voucherService;
        this.permissionGuard = permissionGuard;
    }

    @PostMapping
    public ResponseEntity<VoucherResponseDTO> create(@Valid @RequestBody VoucherRequestDTO dto,
                                                       @AuthenticationPrincipal CustomUserDetails currentUser) {
        permissionGuard.require(currentUser, "vouchers");
        return ResponseEntity.status(HttpStatus.CREATED).body(voucherService.create(dto));
    }

    @GetMapping
    public ResponseEntity<List<VoucherResponseDTO>> getAll(@AuthenticationPrincipal CustomUserDetails currentUser) {
        permissionGuard.require(currentUser, "vouchers");
        return ResponseEntity.ok(voucherService.getAllVouchers());
    }

    private static final Set<String> SORTABLE_FIELDS = Set.of("code", "discountValue", "startDate", "endDate", "usedCount", "createdAt", "updatedAt");

    @GetMapping("/search")
    public ResponseEntity<Page<VoucherResponseDTO>> search(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String discountType,
            @RequestParam(required = false) Boolean isActive,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @AuthenticationPrincipal CustomUserDetails currentUser) {
        permissionGuard.require(currentUser, "vouchers");
        String field = SORTABLE_FIELDS.contains(sortBy) ? sortBy : "createdAt";
        Sort sort = "asc".equalsIgnoreCase(sortDir) ? Sort.by(field).ascending() : Sort.by(field).descending();
        Pageable pageable = PageRequest.of(Math.max(page, 0), Math.min(Math.max(size, 1), 100), sort);
        return ResponseEntity.ok(voucherService.search(search, discountType, isActive, pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<VoucherResponseDTO> getById(@PathVariable Long id, @AuthenticationPrincipal CustomUserDetails currentUser) {
        permissionGuard.require(currentUser, "vouchers");
        return ResponseEntity.ok(voucherService.getVoucherById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<VoucherResponseDTO> update(@PathVariable Long id, @Valid @RequestBody VoucherRequestDTO dto,
                                                       @AuthenticationPrincipal CustomUserDetails currentUser) {
        permissionGuard.require(currentUser, "vouchers");
        return ResponseEntity.ok(voucherService.update(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id, @AuthenticationPrincipal CustomUserDetails currentUser) {
        permissionGuard.require(currentUser, "vouchers");
        voucherService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
