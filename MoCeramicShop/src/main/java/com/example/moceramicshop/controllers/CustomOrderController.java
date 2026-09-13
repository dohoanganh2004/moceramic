package com.example.moceramicshop.controllers;

import com.example.moceramicshop.dtos.request.customorder.CustomOrderAdminUpdateRequestDTO;
import com.example.moceramicshop.dtos.response.customorder.CustomOrderResponseDTO;
import com.example.moceramicshop.security.CustomUserDetails;
import com.example.moceramicshop.services.CustomOrderService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Set;

@RestController
@RequestMapping("/api/custom-orders")
public class CustomOrderController {

    private final CustomOrderService customOrderService;

    public CustomOrderController(CustomOrderService customOrderService) {
        this.customOrderService = customOrderService;
    }

    private static final Set<String> SORTABLE_FIELDS = Set.of("contactName", "status", "quantity", "createdAt");

    @GetMapping("/search")
    public ResponseEntity<Page<CustomOrderResponseDTO>> search(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        String field = SORTABLE_FIELDS.contains(sortBy) ? sortBy : "createdAt";
        Sort sort = "asc".equalsIgnoreCase(sortDir) ? Sort.by(field).ascending() : Sort.by(field).descending();
        Pageable pageable = PageRequest.of(Math.max(page, 0), Math.min(Math.max(size, 1), 100), sort);
        return ResponseEntity.ok(customOrderService.search(search, status, pageable));
    }

    @GetMapping("/my")
    public ResponseEntity<List<CustomOrderResponseDTO>> getMyRequests(@AuthenticationPrincipal CustomUserDetails currentUser) {
        return ResponseEntity.ok(customOrderService.getMyRequests(currentUser.getUser().getId()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<CustomOrderResponseDTO> getById(@PathVariable Long id) {
        return ResponseEntity.ok(customOrderService.getById(id));
    }

    @PatchMapping("/{id}")
    public ResponseEntity<CustomOrderResponseDTO> adminUpdate(@PathVariable Long id,
                                                                 @Valid @RequestBody CustomOrderAdminUpdateRequestDTO dto) {
        return ResponseEntity.ok(customOrderService.adminUpdate(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        customOrderService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
