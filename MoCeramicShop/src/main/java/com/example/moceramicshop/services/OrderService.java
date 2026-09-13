package com.example.moceramicshop.services;

import com.example.moceramicshop.dtos.request.order.OrderCancelRequestDTO;
import com.example.moceramicshop.dtos.request.order.OrderCreateRequestDTO;
import com.example.moceramicshop.dtos.request.order.OrderItemUpdateRequestDTO;
import com.example.moceramicshop.dtos.request.order.OrderStatusUpdateRequestDTO;
import com.example.moceramicshop.dtos.response.order.OrderResponseDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface OrderService {
    List<OrderResponseDTO> getAll();

    Page<OrderResponseDTO> search(String search, String status, Pageable pageable);

    List<OrderResponseDTO> getAllByCustomerId(Long customerId);

    OrderResponseDTO getById(Long id);

    OrderResponseDTO create(Long customerId,OrderCreateRequestDTO request);

    OrderResponseDTO updateStatus(Long orderId, Long actorUserId, OrderStatusUpdateRequestDTO request);

    void delete(Long id);
    void deleteOrderItem(Long orderItemId, Long orderId);

    OrderResponseDTO updateOrderItem(Long orderId, Long orderItemId, OrderItemUpdateRequestDTO request);

    OrderResponseDTO cancel(Long orderId, Long actorUserId, OrderCancelRequestDTO request);
}