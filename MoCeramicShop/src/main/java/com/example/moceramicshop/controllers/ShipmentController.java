package com.example.moceramicshop.controllers;

import com.example.moceramicshop.dtos.request.shipment.ShipmentRequestDTO;
import com.example.moceramicshop.dtos.response.shipment.ShipmentResponseDTO;
import com.example.moceramicshop.security.CustomUserDetails;
import com.example.moceramicshop.services.ShipmentService;
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
@RequestMapping("/api/shipments")
public class ShipmentController {

    private final ShipmentService shipmentService;

    public ShipmentController(ShipmentService shipmentService) {
        this.shipmentService = shipmentService;
    }

    private static final Set<String> SORTABLE_FIELDS = Set.of("status", "carrier", "createdAt", "updatedAt");

    @PostMapping
    public ResponseEntity<ShipmentResponseDTO> create(@Valid @RequestBody ShipmentRequestDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(shipmentService.create(dto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ShipmentResponseDTO> update(@PathVariable Long id, @Valid @RequestBody ShipmentRequestDTO dto) {
        return ResponseEntity.ok(shipmentService.update(id, dto));
    }

    @GetMapping("/search")
    public ResponseEntity<Page<ShipmentResponseDTO>> search(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        String field = SORTABLE_FIELDS.contains(sortBy) ? sortBy : "createdAt";
        Sort sort = "asc".equalsIgnoreCase(sortDir) ? Sort.by(field).ascending() : Sort.by(field).descending();
        Pageable pageable = PageRequest.of(Math.max(page, 0), Math.min(Math.max(size, 1), 100), sort);
        return ResponseEntity.ok(shipmentService.search(search, status, pageable));
    }

    @GetMapping("/order/{orderId}")
    public ResponseEntity<List<ShipmentResponseDTO>> getByOrderId(@PathVariable Long orderId,
                                                                     @AuthenticationPrincipal CustomUserDetails currentUser) {
        return ResponseEntity.ok(shipmentService.getByOrderId(orderId, currentUser.getUser().getId()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        shipmentService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
