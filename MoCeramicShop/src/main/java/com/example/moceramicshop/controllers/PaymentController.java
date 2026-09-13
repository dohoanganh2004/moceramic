package com.example.moceramicshop.controllers;

import com.example.moceramicshop.dtos.request.payment.PaymentRequestDTO;
import com.example.moceramicshop.dtos.request.payment.PaymentStatusUpdateRequestDTO;
import com.example.moceramicshop.dtos.response.order.PaymentResponseDTO;
import com.example.moceramicshop.security.CustomUserDetails;
import com.example.moceramicshop.services.PaymentService;
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
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Set;

@RestController
@RequestMapping("/api/payments")
public class PaymentController {

    private final PaymentService paymentService;

    public PaymentController(PaymentService paymentService) {
        this.paymentService = paymentService;
    }

    private static final Set<String> SORTABLE_FIELDS = Set.of("method", "status", "amount", "createdAt");

    @PostMapping
    public ResponseEntity<PaymentResponseDTO> create(@Valid @RequestBody PaymentRequestDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(paymentService.create(dto));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<PaymentResponseDTO> updateStatus(@PathVariable Long id,
                                                             @Valid @RequestBody PaymentStatusUpdateRequestDTO dto) {
        return ResponseEntity.ok(paymentService.updateStatus(id, dto));
    }

    @GetMapping("/search")
    public ResponseEntity<Page<PaymentResponseDTO>> search(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String method,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        String field = SORTABLE_FIELDS.contains(sortBy) ? sortBy : "createdAt";
        Sort sort = "asc".equalsIgnoreCase(sortDir) ? Sort.by(field).ascending() : Sort.by(field).descending();
        Pageable pageable = PageRequest.of(Math.max(page, 0), Math.min(Math.max(size, 1), 100), sort);
        return ResponseEntity.ok(paymentService.search(search, method, status, pageable));
    }

    @GetMapping("/order/{orderId}")
    public ResponseEntity<List<PaymentResponseDTO>> getByOrderId(@PathVariable Long orderId,
                                                                    @AuthenticationPrincipal CustomUserDetails currentUser) {
        return ResponseEntity.ok(paymentService.getByOrderId(orderId, currentUser.getUser().getId()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        paymentService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
