package com.example.moceramicshop.controllers;

import com.example.moceramicshop.dtos.request.order.OrderCancelRequestDTO;
import com.example.moceramicshop.dtos.request.order.OrderCreateRequestDTO;
import com.example.moceramicshop.dtos.request.order.OrderItemUpdateRequestDTO;
import com.example.moceramicshop.dtos.request.order.OrderStatusUpdateRequestDTO;
import com.example.moceramicshop.dtos.response.order.OrderResponseDTO;
import com.example.moceramicshop.exceptions.ForbiddenException;
import com.example.moceramicshop.security.CustomUserDetails;
import com.example.moceramicshop.security.PermissionGuard;
import com.example.moceramicshop.services.OrderServiceImp;
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
@RequestMapping("/api/order")
public class OrderController {
    private final OrderServiceImp orderServiceImp;
    private final PermissionGuard permissionGuard;
    public OrderController(OrderServiceImp orderServiceImp, PermissionGuard permissionGuard) {
        this.orderServiceImp = orderServiceImp;
        this.permissionGuard = permissionGuard;
    }
    @GetMapping("/all")
    public ResponseEntity<List<OrderResponseDTO>> getAllOrders(@AuthenticationPrincipal CustomUserDetails currentUser) {
        permissionGuard.require(currentUser, "orders");
        return  ResponseEntity.ok(orderServiceImp.getAll());
    }

    private static final Set<String> SORTABLE_FIELDS = Set.of("orderCode", "status", "totalAmount", "createdAt", "updatedAt");

    @GetMapping("/search")
    public ResponseEntity<Page<OrderResponseDTO>> search(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @AuthenticationPrincipal CustomUserDetails currentUser) {
        permissionGuard.require(currentUser, "orders");
        String field = SORTABLE_FIELDS.contains(sortBy) ? sortBy : "createdAt";
        Sort sort = "asc".equalsIgnoreCase(sortDir) ? Sort.by(field).ascending() : Sort.by(field).descending();
        Pageable pageable = PageRequest.of(Math.max(page, 0), Math.min(Math.max(size, 1), 100), sort);
        return ResponseEntity.ok(orderServiceImp.search(search, status, pageable));
    }
    @GetMapping("/user/id")
    public ResponseEntity<List<OrderResponseDTO>> getAllByCustomerId(@AuthenticationPrincipal CustomUserDetails currentUser) {
        return ResponseEntity.ok(orderServiceImp.getAllByCustomerId(currentUser.getUser().getId()));
    }
    @GetMapping("/{orderId}")
    public ResponseEntity<OrderResponseDTO> getOrderDetails(@PathVariable Long orderId, @AuthenticationPrincipal CustomUserDetails currentUser) {
        OrderResponseDTO order = orderServiceImp.getById(orderId);
        boolean isAdmin = "admin".equals(currentUser.getUser().getRole().getName());
        if (!isAdmin && !order.getUserId().equals(currentUser.getUser().getId())) {
            throw new ForbiddenException("Bạn không có quyền xem đơn hàng này");
        }
        return ResponseEntity.ok(order);
    }

    @PostMapping
    public ResponseEntity<OrderResponseDTO> create(@Valid @RequestBody OrderCreateRequestDTO dto,
                                                     @AuthenticationPrincipal CustomUserDetails currentUser) {
        return ResponseEntity.status(HttpStatus.CREATED).body(orderServiceImp.create(currentUser.getUser().getId(), dto));
    }

    @PatchMapping("/{orderId}/status")
    public ResponseEntity<OrderResponseDTO> updateStatus(@PathVariable Long orderId,
                                                           @Valid @RequestBody OrderStatusUpdateRequestDTO dto,
                                                           @AuthenticationPrincipal CustomUserDetails currentUser) {
        permissionGuard.require(currentUser, "orders");
        return ResponseEntity.ok(orderServiceImp.updateStatus(orderId, currentUser.getUser().getId(), dto));
    }

    @DeleteMapping("/{orderId}")
    public ResponseEntity<Void> delete(@PathVariable Long orderId, @AuthenticationPrincipal CustomUserDetails currentUser) {
        permissionGuard.require(currentUser, "orders");
        orderServiceImp.delete(orderId);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{orderId}/cancel")
    public ResponseEntity<OrderResponseDTO> cancel(@PathVariable Long orderId,
                                                     @RequestBody OrderCancelRequestDTO dto,
                                                     @AuthenticationPrincipal CustomUserDetails currentUser) {
        permissionGuard.require(currentUser, "orders");
        return ResponseEntity.ok(orderServiceImp.cancel(orderId, currentUser.getUser().getId(), dto));
    }

    @PatchMapping("/{orderId}/items/{orderItemId}")
    public ResponseEntity<OrderResponseDTO> updateOrderItem(@PathVariable Long orderId,
                                                              @PathVariable Long orderItemId,
                                                              @Valid @RequestBody OrderItemUpdateRequestDTO dto,
                                                              @AuthenticationPrincipal CustomUserDetails currentUser) {
        permissionGuard.require(currentUser, "orders");
        return ResponseEntity.ok(orderServiceImp.updateOrderItem(orderId, orderItemId, dto));
    }

    @DeleteMapping("/{orderId}/items/{orderItemId}")
    public ResponseEntity<Void> deleteOrderItem(@PathVariable Long orderId, @PathVariable Long orderItemId,
                                                 @AuthenticationPrincipal CustomUserDetails currentUser) {
        permissionGuard.require(currentUser, "orders");
        orderServiceImp.deleteOrderItem(orderItemId, orderId);
        return ResponseEntity.noContent().build();
    }
}
