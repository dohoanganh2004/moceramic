package com.example.moceramicshop.services;

import com.example.moceramicshop.dtos.request.order.OrderCreateRequestDTO;
import com.example.moceramicshop.dtos.response.order.OrderResponseDTO;

import java.util.List;

public interface OrderService {
    List<OrderResponseDTO> getAll();

    List<OrderResponseDTO> getAllByCustomerId(Long customerId);

    OrderResponseDTO getById(Long id);

    OrderResponseDTO create(Long customerId,OrderCreateRequestDTO request);

}